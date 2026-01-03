"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CollectionPeriod } from "@/lib/types/database";
import { getMonthName } from "@/lib/format";
import { Calendar } from "lucide-react";

interface HistoryFilterProps {
  periods: CollectionPeriod[];
  selectedPeriodId?: string;
}

export function HistoryFilter({
  periods,
  selectedPeriodId,
}: HistoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePeriodChange(periodId: string) {
    const params = new URLSearchParams(searchParams);
    if (periodId) {
      params.set("period", periodId);
    } else {
      params.delete("period");
    }
    router.push(`/history?${params.toString()}`);
  }

  // Group periods by year
  const periodsByYear = periods.reduce((acc, period) => {
    if (!acc[period.year]) {
      acc[period.year] = [];
    }
    acc[period.year].push(period);
    return acc;
  }, {} as Record<number, CollectionPeriod[]>);

  const years = Object.keys(periodsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Card className="mb-6 border-slate-200/50 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              <Calendar className="w-4 h-4 inline mr-2" />
              Pilih Periode
            </label>
            <select
              value={selectedPeriodId || ""}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">-- Pilih Periode --</option>
              {years.map((year) => (
                <optgroup key={year} label={year.toString()}>
                  {periodsByYear[year].map((period) => (
                    <option key={period.id} value={period.id}>
                      {getMonthName(period.month)} {period.year}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
