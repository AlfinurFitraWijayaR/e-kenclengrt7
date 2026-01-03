"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ContributionTransactionInsert } from "@/lib/types/database";

/**
 * Record a cash payment (CREDIT transaction)
 */
export async function recordPayment(
  householdId: string,
  amount: number,
  periodId: string | null,
  description?: string
) {
  const supabase = await createClient();

  const transactionData: ContributionTransactionInsert = {
    household_id: householdId,
    period_id: periodId,
    transaction_date: new Date().toISOString().split("T")[0],
    type: "CREDIT",
    amount,
    description: description || "Pembayaran iuran",
  };

  const { data, error } = await supabase
    .from("contribution_transactions")
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    console.error("Error recording payment:", error);
    throw new Error("Gagal mencatat pembayaran");
  }

  revalidatePath("/households");
  revalidatePath(`/households/${householdId}`);
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return data;
}

/**
 * Get all transactions with filters
 */
export async function getTransactions(options?: {
  periodId?: string;
  householdId?: string;
  type?: "DEBIT" | "CREDIT";
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("contribution_transactions")
    .select(
      `
      *,
      households (
        id,
        name
      ),
      collection_periods (
        id,
        month,
        year
      )
    `
    )
    .order("transaction_date", { ascending: false });

  if (options?.periodId) {
    query = query.eq("period_id", options.periodId);
  }

  if (options?.householdId) {
    query = query.eq("household_id", options.householdId);
  }

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  if (options?.startDate) {
    query = query.gte("transaction_date", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("transaction_date", options.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Gagal mengambil data transaksi");
  }

  return data || [];
}

/**
 * Get transactions for a specific period
 */
export async function getTransactionsByPeriod(periodId: string) {
  return getTransactions({ periodId, type: "CREDIT" });
}

/**
 * Delete a transaction (admin only)
 */
export async function deleteTransaction(id: string, householdId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contribution_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Gagal menghapus transaksi");
  }

  revalidatePath("/households");
  revalidatePath(`/households/${householdId}`);
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

/**
 * Update a transaction (admin only)
 */
export async function updateTransaction(
  id: string,
  data: {
    amount?: number;
    description?: string;
    transaction_date?: string;
  }
) {
  const supabase = await createClient();

  const { data: transaction, error } = await supabase
    .from("contribution_transactions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Gagal mengupdate transaksi");
  }

  revalidatePath("/households");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return transaction;
}

/**
 * Get total cash collected
 */
export async function getTotalCashCollected(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contribution_transactions")
    .select("amount")
    .eq("type", "CREDIT");

  if (error) {
    console.error("Error fetching total cash:", error);
    return 0;
  }

  return (data || []).reduce((sum, t) => sum + t.amount, 0);
}
