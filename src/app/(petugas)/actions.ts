"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/actions/auth";
import { ContributionTransactionInsert } from "@/lib/types/database";

/**
 * Record a payment as an officer (CREDIT transaction only)
 * This action validates the user is authenticated and records a CREDIT transaction
 */
export async function recordPaymentAsOfficer(
  householdId: string,
  amount: number,
  periodId: string,
  description?: string
) {
  const profile = await requireAuth();

  if (!householdId || amount <= 0) {
    throw new Error("Data pembayaran tidak valid");
  }

  const supabase = await createClient();

  const transactionData: ContributionTransactionInsert = {
    household_id: householdId,
    period_id: periodId,
    transaction_date: new Date().toISOString().split("T")[0],
    type: "CREDIT",
    amount,
    description:
      description || `Pembayaran iuran (via ${profile.full_name || "Petugas"})`,
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

  revalidatePath("/petugas");
  revalidatePath("/petugas/households");
  revalidatePath("/petugas/history");
  revalidatePath("/households");
  revalidatePath(`/households/${householdId}`);
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return data;
}

/**
 * Get transaction history for a specific household (read-only for officers)
 */
export async function getHouseholdTransactionsForOfficer(householdId: string) {
  // Require authentication
  await requireAuth();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contribution_transactions")
    .select(
      `
      id,
      transaction_date,
      type,
      amount,
      description,
      created_at
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

/**
 * Get all recent transactions (read-only for officers)
 */
export async function getRecentTransactionsForOfficer(limit: number = 50) {
  // Require authentication
  await requireAuth();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contribution_transactions")
    .select(
      `
      id,
      transaction_date,
      type,
      amount,
      description,
      created_at,
      households (
        id,
        name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Gagal mengambil riwayat transaksi");
  }

  return data || [];
}
