-- =====================================================
-- E-KENCLENG RT 7 - DATABASE SCHEMA
-- Community Cash Collection System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'officer' CHECK (role IN ('admin', 'officer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: households
-- =====================================================
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contribution_start_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_households_status ON households(status);
CREATE INDEX IF NOT EXISTS idx_households_contribution_start_date ON households(contribution_start_date);

-- =====================================================
-- TABLE: collection_periods
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(month, year),
    CHECK (end_date >= start_date)
);

-- Create index for faster period lookups
CREATE INDEX IF NOT EXISTS idx_collection_periods_year_month ON collection_periods(year, month);

-- =====================================================
-- TABLE: contribution_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS contribution_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    period_id UUID REFERENCES collection_periods(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_household_id ON contribution_transactions(household_id);
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_period_id ON contribution_transactions(period_id);
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_type ON contribution_transactions(type);
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_date ON contribution_transactions(transaction_date);

-- =====================================================
-- FUNCTION: Calculate household balance
-- Balance = SUM(CREDIT.amount) - (total_days × 500)
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_household_balance(p_household_id UUID)
RETURNS TABLE (
    balance INTEGER,
    total_days INTEGER,
    total_obligation INTEGER,
    total_payments INTEGER
) AS $$
DECLARE
    v_start_date DATE;
    v_total_days INTEGER;
    v_total_payments INTEGER;
    v_total_obligation INTEGER;
    v_balance INTEGER;
BEGIN
    -- Get the contribution start date
    SELECT contribution_start_date INTO v_start_date
    FROM households
    WHERE id = p_household_id;
    
    IF v_start_date IS NULL THEN
        RETURN QUERY SELECT 0, 0, 0, 0;
        RETURN;
    END IF;
    
    -- Calculate total days from contribution_start_date until today
    v_total_days := GREATEST(0, CURRENT_DATE - v_start_date + 1);
    
    -- Calculate total obligation (500 IDR per day)
    v_total_obligation := v_total_days * 500;
    
    -- Calculate total payments (sum of all CREDIT transactions)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_payments
    FROM contribution_transactions
    WHERE household_id = p_household_id AND type = 'CREDIT';
    
    -- Calculate balance
    v_balance := v_total_payments - v_total_obligation;
    
    RETURN QUERY SELECT v_balance, v_total_days, v_total_obligation, v_total_payments;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get all households with their balances
-- =====================================================
CREATE OR REPLACE FUNCTION get_all_households_with_balance()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    contribution_start_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMPTZ,
    balance INTEGER,
    total_days INTEGER,
    total_obligation INTEGER,
    total_payments INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.contribution_start_date,
        h.status,
        h.created_at,
        cb.balance,
        cb.total_days,
        cb.total_obligation,
        cb.total_payments
    FROM households h
    CROSS JOIN LATERAL calculate_household_balance(h.id) cb
    ORDER BY h.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get period report
-- Shows payment status for each household in a period
-- =====================================================
CREATE OR REPLACE FUNCTION get_period_report(p_period_id UUID)
RETURNS TABLE (
    household_id UUID,
    household_name VARCHAR(255),
    total_due INTEGER,
    total_paid INTEGER,
    status VARCHAR(10)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_period_days INTEGER;
BEGIN
    -- Get period dates
    SELECT cp.start_date, cp.end_date 
    INTO v_start_date, v_end_date
    FROM collection_periods cp
    WHERE cp.id = p_period_id;
    
    IF v_start_date IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate period days
    v_period_days := v_end_date - v_start_date + 1;
    
    RETURN QUERY
    SELECT 
        h.id AS household_id,
        h.name AS household_name,
        (v_period_days * 500)::INTEGER AS total_due,
        COALESCE(SUM(CASE WHEN ct.type = 'CREDIT' THEN ct.amount ELSE 0 END), 0)::INTEGER AS total_paid,
        CASE 
            WHEN COALESCE(SUM(CASE WHEN ct.type = 'CREDIT' THEN ct.amount ELSE 0 END), 0) >= (v_period_days * 500) 
            THEN 'PAID'::VARCHAR(10)
            ELSE 'UNPAID'::VARCHAR(10)
        END AS status
    FROM households h
    LEFT JOIN contribution_transactions ct ON ct.household_id = h.id 
        AND ct.period_id = p_period_id
    WHERE h.status = 'active'
        AND h.contribution_start_date <= v_end_date
    GROUP BY h.id, h.name
    ORDER BY h.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get dashboard summary
-- =====================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE (
    total_households INTEGER,
    active_households INTEGER,
    total_cash_collected BIGINT,
    households_in_debt INTEGER,
    households_with_deposit INTEGER,
    total_debt_amount BIGINT,
    total_deposit_amount BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH household_balances AS (
        SELECT 
            h.id,
            h.status,
            cb.balance
        FROM households h
        CROSS JOIN LATERAL calculate_household_balance(h.id) cb
    )
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM households) AS total_households,
        (SELECT COUNT(*)::INTEGER FROM households WHERE status = 'active') AS active_households,
        (SELECT COALESCE(SUM(amount), 0)::BIGINT FROM contribution_transactions WHERE type = 'CREDIT') AS total_cash_collected,
        (SELECT COUNT(*)::INTEGER FROM household_balances WHERE balance < 0 AND status = 'active') AS households_in_debt,
        (SELECT COUNT(*)::INTEGER FROM household_balances WHERE balance > 0 AND status = 'active') AS households_with_deposit,
        (SELECT COALESCE(ABS(SUM(balance)), 0)::BIGINT FROM household_balances WHERE balance < 0 AND status = 'active') AS total_debt_amount,
        (SELECT COALESCE(SUM(balance), 0)::BIGINT FROM household_balances WHERE balance > 0 AND status = 'active') AS total_deposit_amount;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Authenticated users can view all households
CREATE POLICY "Authenticated users can view households" ON households
    FOR SELECT TO authenticated USING (true);

-- Policy: Only admin can insert/update/delete households
CREATE POLICY "Admin can insert households" ON households
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can update households" ON households
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete households" ON households
    FOR DELETE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy: Authenticated users can view all collection periods
CREATE POLICY "Authenticated users can view collection_periods" ON collection_periods
    FOR SELECT TO authenticated USING (true);

-- Policy: Admin can manage collection periods
CREATE POLICY "Admin can insert collection_periods" ON collection_periods
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can update collection_periods" ON collection_periods
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete collection_periods" ON collection_periods
    FOR DELETE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy: Authenticated users can view all transactions
CREATE POLICY "Authenticated users can view contribution_transactions" ON contribution_transactions
    FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can insert transactions (officers and admin)
CREATE POLICY "Authenticated users can insert contribution_transactions" ON contribution_transactions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: Only admin can update/delete transactions
CREATE POLICY "Admin can update contribution_transactions" ON contribution_transactions
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete contribution_transactions" ON contribution_transactions
    FOR DELETE TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- TRIGGER: Update users.updated_at on change
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Create user profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'officer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Allow officers to insert CREDIT transactions only
CREATE POLICY "Officers can insert CREDIT transactions" ON contribution_transactions
FOR INSERT
WITH CHECK (
  auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'officer'))
  AND type = 'CREDIT'
);
-- Only admins can update/delete transactions
CREATE POLICY "Only admins can update transactions" ON contribution_transactions
FOR UPDATE
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
CREATE POLICY "Only admins can delete transactions" ON contribution_transactions
FOR DELETE
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
-- All authenticated users can read households
CREATE POLICY "Authenticated users can read households" ON households
FOR SELECT
USING (auth.role() = 'authenticated');
-- Only admins can modify households
CREATE POLICY "Only admins can modify households" ON households
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);