"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard-components";
import { StatusBadge } from "@/components/balance-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollectionPeriod, PeriodReport } from "@/lib/types/database";
import { formatCurrency, getMonthName } from "@/lib/format";
import { getCollectionPeriod, getPeriodReport } from "@/lib/actions/periods";
import Link from "next/link";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryContentProps {
  periods: CollectionPeriod[];
  initialPeriod: CollectionPeriod | null;
  initialReport: PeriodReport[];
}

export function HistoryContent({
  periods,
  initialPeriod,
  initialReport,
}: HistoryContentProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    initialPeriod?.id || "",
  );
  const [selectedPeriod, setSelectedPeriod] = useState<CollectionPeriod | null>(
    initialPeriod,
  );
  const [report, setReport] = useState<PeriodReport[]>(initialReport);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodsByYear = periods.reduce(
    (acc, period) => {
      if (!acc[period.year]) {
        acc[period.year] = [];
      }
      acc[period.year].push(period);
      return acc;
    },
    {} as Record<number, CollectionPeriod[]>,
  );

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
    const url = `/api/export/pdf?period=${selectedPeriodId}`;
    window.open(url, "_blank");

    setIsLoading(false);
  }

  async function handlePeriodChange(periodId: string) {
    setSelectedPeriodId(periodId);

    if (!periodId) {
      setSelectedPeriod(null);
      setReport([]);
      return;
    }

    startTransition(async () => {
      try {
        const [periodData, reportData] = await Promise.all([
          getCollectionPeriod(periodId),
          getPeriodReport(periodId),
        ]);
        setSelectedPeriod(periodData);
        setReport(reportData);
      } catch (error) {
        console.error("Error fetching period data:", error);
      }
    });
  }

  return (
    <>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {/* Filter & Export PDF */}
      <Card className="mb-6 border-slate-200/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-2" />
                Pilih Periode
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={isPending}
                className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white disabled:opacity-50"
              >
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

          {/* Eksport PDF */}
          <Button
            onClick={handleOpenReport}
            disabled={isLoading || !selectedPeriodId}
            className="cursor-pointer mt-3 w-max px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Export PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isPending && (
        <Card className="mb-6 border-slate-200/50 shadow-sm">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-slate-600">Memuat data...</span>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isPending && !selectedPeriod ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon="History"
              title="Belum Ada Periode"
              description="Buat periode penarikan terlebih dahulu untuk melihat riwayat"
              action={
                <Link
                  href="/admin/periods/new"
                  className="text-emerald-600 hover:underline"
                >
                  Buat Periode Baru
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        !isPending && (
          <>
            {/* Report Table */}
            <Card className="border-slate-200/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Status Pembayaran per Rumah Tangga
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.length === 0 ? (
                  <EmptyState
                    icon="Users"
                    title="Tidak Ada Data"
                    description="Belum ada rumah tangga yang terdaftar untuk periode ini"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead className="text-right">Tagihan</TableHead>
                          <TableHead className="text-right">Dibayar</TableHead>
                          <TableHead className="text-right">Hutang</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.map((row) => {
                          const difference = row.total_paid - row.total_due;
                          return (
                            <TableRow key={row.household_id}>
                              <TableCell>
                                <Link
                                  href={`/admin/warga/${row.household_id}`}
                                  className="font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                                >
                                  {row.household_name}
                                </Link>
                              </TableCell>
                              <TableCell className="text-right text-slate-600">
                                {formatCurrency(row.total_due)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-emerald-600">
                                {formatCurrency(row.total_paid)}
                              </TableCell>
                              <TableCell
                                className={`text-right font-mono ${
                                  difference >= 0
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {difference >= 0 ? "+" : ""}
                                {formatCurrency(difference)}
                              </TableCell>
                              <TableCell className="text-center">
                                <StatusBadge status={row.status} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )
      )}
    </>
  );
}
