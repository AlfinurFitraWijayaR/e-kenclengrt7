"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  HouseholdInsert,
  HouseholdUpdate,
  HouseholdWithBalance,
} from "@/lib/types/database";

// Get all households with calculated balances
export async function getHouseholdsWithBalance(): Promise<
  HouseholdWithBalance[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_all_households_with_balance");

  if (error) {
    console.error("Error fetching households:", error);
    throw new Error("Gagal mengambil data rumah tangga");
  }

  return (data || []) as HouseholdWithBalance[];
}

// Get a single household with balance
export async function getHouseholdWithBalance(
  id: string
): Promise<HouseholdWithBalance | null> {
  const supabase = await createClient();

  // Get household data
  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("*")
    .eq("id", id)
    .single();

  if (householdError || !household) {
    console.error("Error fetching household:", householdError);
    return null;
  }

  // Get balance calculation
  const { data: balanceData, error: balanceError } = await supabase.rpc(
    "calculate_household_balance",
    { p_household_id: id }
  );

  if (balanceError) {
    console.error("Error calculating balance:", balanceError);
    throw new Error("Gagal menghitung saldo");
  }

  const balanceInfo = balanceData?.[0] || {
    balance: 0,
    total_days: 0,
    total_obligation: 0,
    total_payments: 0,
  };

  return {
    ...household,
    balance: balanceInfo.balance,
    total_days: balanceInfo.total_days,
    total_obligation: balanceInfo.total_obligation,
    total_payments: balanceInfo.total_payments,
  };
}

// Get all households (simple list)
export async function getHouseholds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("households")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching households:", error);
    throw new Error("Gagal mengambil data rumah tangga");
  }

  return data || [];
}

// Create a new household
export async function createHousehold(data: HouseholdInsert) {
  const supabase = await createClient();

  const { data: household, error } = await supabase
    .from("households")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating household:", error);
    throw new Error("Gagal membuat data warga: " + error.message);
  }

  revalidatePath("/households");
  revalidatePath("/dashboard");

  return household;
}

// Update a household
export async function updateHousehold(id: string, data: HouseholdUpdate) {
  const supabase = await createClient();

  const { data: household, error } = await supabase
    .from("households")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating household:", error);
    throw new Error("Gagal mengupdate data rumah tangga");
  }

  revalidatePath("/households");
  revalidatePath(`/households/${id}`);
  revalidatePath("/dashboard");

  return household;
}

// Delete a household
export async function deleteHousehold(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("households").delete().eq("id", id);

  if (error) {
    console.error("Error deleting household:", error);
    throw new Error("Gagal menghapus data rumah tangga");
  }

  revalidatePath("/households");
  revalidatePath("/dashboard");
}

// Get household transaction history
export async function getHouseholdTransactions(householdId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contribution_transactions")
    .select(
      `
      *,
      collection_periods (
        month,
        year
      )
    `
    )
    .eq("household_id", householdId)
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Gagal mengambil riwayat transaksi");
  }

  return data || [];
}
