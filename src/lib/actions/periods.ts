"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  CollectionPeriodInsert,
  CollectionPeriodUpdate,
  PeriodReport,
} from "@/lib/types/database";
import { getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/format";

/**
 * Get all collection periods
 */
export async function getCollectionPeriods() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_periods")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching periods:", error);
    throw new Error("Gagal mengambil data periode");
  }

  return data || [];
}

/**
 * Get a single collection period
 */
export async function getCollectionPeriod(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_periods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching period:", error);
    throw new Error("Gagal mengambil data periode");
  }

  return data;
}

/**
 * Create a new collection period
 */
export async function createCollectionPeriod(
  month: number,
  year: number,
  notes?: string
) {
  const supabase = await createClient();

  const periodData: CollectionPeriodInsert = {
    month,
    year,
    start_date: getFirstDayOfMonth(year, month),
    end_date: getLastDayOfMonth(year, month),
    notes: notes || null,
  };

  const { data, error } = await supabase
    .from("collection_periods")
    .insert(periodData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Periode untuk bulan dan tahun ini sudah ada");
    }
    console.error("Error creating period:", error);
    throw new Error("Gagal membuat periode");
  }

  revalidatePath("/periods");

  return data;
}

/**
 * Update a collection period
 */
export async function updateCollectionPeriod(
  id: string,
  data: CollectionPeriodUpdate
) {
  const supabase = await createClient();

  const { data: period, error } = await supabase
    .from("collection_periods")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating period:", error);
    throw new Error("Gagal mengupdate periode");
  }

  revalidatePath("/periods");

  return period;
}

/**
 * Delete a collection period
 */
export async function deleteCollectionPeriod(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collection_periods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting period:", error);
    throw new Error("Gagal menghapus periode");
  }

  revalidatePath("/periods");
}

/**
 * Get period report with household statuses
 */
export async function getPeriodReport(
  periodId: string
): Promise<PeriodReport[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_period_report", {
    p_period_id: periodId,
  });

  if (error) {
    console.error("Error fetching period report:", error);
    throw new Error("Gagal mengambil laporan periode");
  }

  // Map raw RPC data to PeriodReport type
  return (data || []).map(
    (row: {
      household_id: string;
      household_name: string;
      total_due: number;
      total_paid: number;
      status: string;
    }) => ({
      household_id: row.household_id,
      household_name: row.household_name,
      total_due: row.total_due,
      total_paid: row.total_paid,
      status: row.status as "PAID" | "UNPAID",
    })
  );
}

/**
 * Get available years for filtering
 */
export async function getAvailableYears(): Promise<number[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_periods")
    .select("year")
    .order("year", { ascending: false });

  if (error) {
    console.error("Error fetching years:", error);
    return [new Date().getFullYear()];
  }

  const uniqueYears = [...new Set((data || []).map((p) => p.year))];
  return uniqueYears.length > 0 ? uniqueYears : [new Date().getFullYear()];
}
