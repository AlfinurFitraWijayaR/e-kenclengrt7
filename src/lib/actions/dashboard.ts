"use server";

import { createClient } from "@/lib/supabase/server";
import { DashboardSummary, HouseholdWithBalance } from "@/lib/types/database";

// Type for recent payment with household info
interface RecentPayment {
  id: string;
  household_id: string;
  period_id: string | null;
  transaction_date: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  description: string | null;
  created_at: string;
  households: {
    id: string;
    name: string;
  } | null;
}

/**
 * Get dashboard summary data
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_dashboard_summary");

  if (error) {
    console.error("Error fetching dashboard summary:", error);
    // Return default values on error
    return {
      total_households: 0,
      active_households: 0,
      total_cash_collected: 0,
      households_in_debt: 0,
      households_with_deposit: 0,
      total_debt_amount: 0,
      total_deposit_amount: 0,
    };
  }

  // RPC returns an array, get first row
  const summary = data?.[0] || {
    total_households: 0,
    active_households: 0,
    total_cash_collected: 0,
    households_in_debt: 0,
    households_with_deposit: 0,
    total_debt_amount: 0,
    total_deposit_amount: 0,
  };

  return summary;
}

/**
 * Get recent payments for dashboard
 */
export async function getRecentPayments(
  limit: number = 5
): Promise<RecentPayment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contribution_transactions")
    .select(
      `
      *,
      households (
        id,
        name
      )
    `
    )
    .eq("type", "CREDIT")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent payments:", error);
    return [];
  }

  return (data || []) as RecentPayment[];
}

/**
 * Get households with highest debt for dashboard
 */
export async function getHouseholdsWithMostDebt(
  limit: number = 5
): Promise<HouseholdWithBalance[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_all_households_with_balance");

  if (error) {
    console.error("Error fetching households with debt:", error);
    return [];
  }

  // Filter and sort by debt (negative balance)
  const householdsWithDebt = (data || [])
    .filter((h) => h.balance < 0 && h.status === "active")
    .sort((a, b) => a.balance - b.balance)
    .slice(0, limit);

  return householdsWithDebt as HouseholdWithBalance[];
}
