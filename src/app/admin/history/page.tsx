import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { StatusBadge } from "@/components/balance-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCollectionPeriods,
  getCollectionPeriod,
  getPeriodReport,
} from "@/lib/actions/periods";
import { formatCurrency, getMonthName, daysBetween } from "@/lib/format";
import Link from "next/link";
import { HistoryFilter } from "./history-filter";

export const metadata: Metadata = {
  title: "Riwayat Penarikan - E-Kencleng RT 7",
  description: "Riwayat penarikan iuran per periode",
};

interface HistoryPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const periods = await getCollectionPeriods();

  // Get selected period or use the most recent one
  const selectedPeriodId = params.period || periods[0]?.id;
  const selectedPeriod = selectedPeriodId
    ? await getCollectionPeriod(selectedPeriodId)
    : null;

  const report = selectedPeriodId
    ? await getPeriodReport(selectedPeriodId)
    : [];

  // Calculate summary
  const totalDue = report.reduce((sum, r) => sum + r.total_due, 0);
  const totalPaid = report.reduce((sum, r) => sum + r.total_paid, 0);
  const paidCount = report.filter((r) => r.status === "PAID").length;
  const unpaidCount = report.filter((r) => r.status === "UNPAID").length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Riwayat Penarikan"
        description="Lihat status penarikan per periode"
      />

      {/* Filter */}
      <HistoryFilter periods={periods} selectedPeriodId={selectedPeriodId} />

      {!selectedPeriod ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon="History"
              title="Belum Ada Periode"
              description="Buat periode penarikan terlebih dahulu untuk melihat riwayat"
              action={
                <Link
                  href="/periods/new"
                  className="text-emerald-600 hover:underline"
                >
                  Buat Periode Baru
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Period Summary */}
          <Card className="mb-6 border-slate-200/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Ringkasan penarikan bulan {getMonthName(selectedPeriod.month)}{" "}
                {selectedPeriod.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-500">Total Kewajiban</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(totalDue)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {daysBetween(
                      selectedPeriod.start_date,
                      selectedPeriod.end_date
                    )}{" "}
                    hari × {report.length} rumah × Rp 500
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50">
                  <p className="text-sm text-emerald-600">Total Terkumpul</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {formatCurrency(totalPaid)}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {Math.round((totalPaid / totalDue) * 100) || 0}% dari target
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600">Lunas</p>
                  <p className="text-lg font-semibold text-green-700">
                    {paidCount} Rumah
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-50">
                  <p className="text-sm text-red-600">Belum Lunas</p>
                  <p className="text-lg font-semibold text-red-700">
                    {unpaidCount} Rumah
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                        <TableHead className="text-right">Kewajiban</TableHead>
                        <TableHead className="text-right">Dibayar</TableHead>
                        <TableHead className="text-right">Selisih</TableHead>
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
                                href={`/households/${row.household_id}`}
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
      )}
    </DashboardLayout>
  );
}
