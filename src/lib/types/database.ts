export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "officer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "officer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "admin" | "officer";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      households: {
        Row: {
          id: string;
          name: string;
          contribution_start_date: string;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contribution_start_date: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contribution_start_date?: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Relationships: [];
      };
      collection_periods: {
        Row: {
          id: string;
          month: number;
          year: number;
          start_date: string;
          end_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          month: number;
          year: number;
          start_date: string;
          end_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          month?: number;
          year?: number;
          start_date?: string;
          end_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contribution_transactions: {
        Row: {
          id: string;
          household_id: string;
          period_id: string | null;
          transaction_date: string;
          type: "DEBIT" | "CREDIT";
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          period_id?: string | null;
          transaction_date: string;
          type: "DEBIT" | "CREDIT";
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          period_id?: string | null;
          transaction_date?: string;
          type?: "DEBIT" | "CREDIT";
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contribution_transactions_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contribution_transactions_period_id_fkey";
            columns: ["period_id"];
            referencedRelation: "collection_periods";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_household_balance: {
        Args: { p_household_id: string };
        Returns: {
          balance: number;
          total_days: number;
          total_obligation: number;
          total_payments: number;
        }[];
      };
      get_period_report: {
        Args: { p_period_id: string };
        Returns: {
          household_id: string;
          household_name: string;
          total_due: number;
          total_paid: number;
          status: string;
        }[];
      };
      get_dashboard_summary: {
        Args: Record<string, never>;
        Returns: {
          total_households: number;
          active_households: number;
          total_cash_collected: number;
          households_in_debt: number;
          households_with_deposit: number;
          total_debt_amount: number;
          total_deposit_amount: number;
        }[];
      };
      get_all_households_with_balance: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          contribution_start_date: string;
          status: string;
          created_at: string;
          balance: number;
          total_days: number;
          total_obligation: number;
          total_payments: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Household = Database["public"]["Tables"]["households"]["Row"];
export type HouseholdInsert =
  Database["public"]["Tables"]["households"]["Insert"];
export type HouseholdUpdate =
  Database["public"]["Tables"]["households"]["Update"];

export type CollectionPeriod =
  Database["public"]["Tables"]["collection_periods"]["Row"];
export type CollectionPeriodInsert =
  Database["public"]["Tables"]["collection_periods"]["Insert"];
export type CollectionPeriodUpdate =
  Database["public"]["Tables"]["collection_periods"]["Update"];

export type ContributionTransaction =
  Database["public"]["Tables"]["contribution_transactions"]["Row"];
export type ContributionTransactionInsert =
  Database["public"]["Tables"]["contribution_transactions"]["Insert"];
export type ContributionTransactionUpdate =
  Database["public"]["Tables"]["contribution_transactions"]["Update"];

// Extended types with calculated fields
export interface HouseholdWithBalance extends Household {
  balance: number;
  total_days: number;
  total_obligation: number;
  total_payments: number;
}

export interface PeriodReport {
  household_id: string;
  household_name: string;
  total_due: number;
  total_paid: number;
  status: "PAID" | "UNPAID";
}

export interface DashboardSummary {
  total_households: number;
  active_households: number;
  total_cash_collected: number;
  households_in_debt: number;
  households_with_deposit: number;
  total_debt_amount: number;
  total_deposit_amount: number;
}
