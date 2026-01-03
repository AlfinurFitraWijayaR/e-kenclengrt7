import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { BalanceDisplay, StatusBadge } from "@/components/balance-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getHouseholdWithBalance,
  getHouseholdTransactions,
} from "@/lib/actions/households";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { formatCurrency, formatDate, getMonthName } from "@/lib/format";
import { Edit, ArrowLeft, Calendar, Wallet, Receipt } from "lucide-react";
import Link from "next/link";
import { PaymentDialog } from "./payment-dialog";

export const metadata: Metadata = {
  title: "Detail Rumah Tangga - E-Kencleng RT 7",
};

interface HouseholdDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminHouseholdDetailPage({
  params,
}: HouseholdDetailPageProps) {
  const { id } = await params;

  const [household, transactions, periods] = await Promise.all([
    getHouseholdWithBalance(id),
    getHouseholdTransactions(id),
    getCollectionPeriods(),
  ]);

  if (!household) {
    notFound();
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={household.name}
        description="Detail rumah tangga dan riwayat transaksi"
        action={
          <div className="flex gap-2">
            <Link href="/admin/warga">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <Link href={`/admin/warga/${id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Mulai Iuran</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(household.contribution_start_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Kewajiban</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(household.total_obligation)}
                </p>
                <p className="text-xs text-slate-400">
                  {household.total_days} hari × Rp 500
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Pembayaran</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(household.total_payments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 border-slate-200/50 shadow-sm overflow-hidden">
        <div
          className={`p-6 ${
            household.balance < 0
              ? "bg-gradient-to-r from-red-500 to-rose-600"
              : household.balance > 0
              ? "bg-gradient-to-r from-emerald-500 to-teal-600"
              : "bg-gradient-to-r from-slate-500 to-slate-700"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-white/80 text-sm mb-1">Saldo Saat Ini</p>
              <BalanceDisplay
                balance={household.balance}
                size="lg"
                showBadge={false}
                light={true}
              />
              <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                Status: <StatusBadge status={household.status} />
              </p>
            </div>
            <PaymentDialog
              householdId={household.id}
              householdName={household.name}
              periods={periods}
            />
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Belum ada transaksi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.transaction_date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type === "CREDIT" ? "default" : "secondary"
                          }
                          className={
                            tx.type === "CREDIT"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : ""
                          }
                        >
                          {tx.type === "CREDIT" ? "Pembayaran" : "Iuran"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.collection_periods
                          ? `${getMonthName(tx.collection_periods.month)} ${
                              tx.collection_periods.year
                            }`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          tx.type === "CREDIT"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "CREDIT" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
