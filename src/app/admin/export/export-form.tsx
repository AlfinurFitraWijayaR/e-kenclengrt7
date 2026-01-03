"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CollectionPeriod } from "@/lib/types/database";
import { getMonthName } from "@/lib/format";
import { Loader2, ExternalLink, Printer } from "lucide-react";

interface ExportFormProps {
  periods: CollectionPeriod[];
}

export function ExportForm({ periods }: ExportFormProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods[0]?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function handleOpenReport() {
    if (!selectedPeriodId) {
      setError("Pilih periode terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Open report in new tab
    const url = `/api/export/pdf?period=${selectedPeriodId}`;
    window.open(url, "_blank");

    setIsLoading(false);
  }

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="period">Pilih Periode</Label>
        <select
          id="period"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
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

      {selectedPeriodId && selectedPeriod && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-3">
            <Printer className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">Siap untuk dilihat</p>
              <p className="text-sm text-emerald-700">
                Laporan {getMonthName(selectedPeriod.month)}{" "}
                {selectedPeriod.year}
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleOpenReport}
        disabled={isLoading || !selectedPeriodId}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Memuat...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka Laporan
          </>
        )}
      </Button>

      <p className="text-sm text-slate-500 text-center">
        Laporan akan dibuka di tab baru. Gunakan <strong>Ctrl+P</strong> atau{" "}
        <strong>⌘+P</strong> untuk mencetak atau menyimpan sebagai PDF.
      </p>
    </div>
  );
}
