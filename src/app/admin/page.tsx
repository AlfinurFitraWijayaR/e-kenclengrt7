import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import {
  PageHeader,
  StatCard,
  EmptyState,
} from "@/components/dashboard-components";
import { BalanceDisplay } from "@/components/balance-display";
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
  getDashboardSummary,
  getRecentPayments,
  getHouseholdsWithMostDebt,
} from "@/lib/actions/dashboard";
import { formatCurrency, formatDate } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin - E-Kencleng RT 7",
  description: "Dashboard admin pengelolaan iuran warga RT 7",
};

export default async function AdminDashboardPage() {
  const [summary, recentPayments, householdsWithDebt] = await Promise.all([
    getDashboardSummary(),
    getRecentPayments(5),
    getHouseholdsWithMostDebt(5),
  ]);

  const username = (await getUserProfile())?.full_name;

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Admin"
        description={
          <>
            Wilujeung Sumping <span className="font-semibold">{username}</span>,
            Berikut ringkasan iuran warga per {formatDate(new Date())}
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Rumah Tangga"
          value={summary.active_households}
          subtitle={`${summary.total_households} total terdaftar`}
          icon="Users"
          variant="default"
        />
        <StatCard
          title="Total Kas Terkumpul"
          value={formatCurrency(summary.total_cash_collected - 23000)}
          subtitle="Dari semua pembayaran"
          icon="Wallet"
          variant="success"
        />
        <StatCard
          title="Rumah Tangga Berhutang"
          value={summary.households_in_debt}
          subtitle={`Total ${formatCurrency(summary.total_debt_amount)}`}
          icon="TrendingDown"
          variant="danger"
        />
        <StatCard
          title="Rumah Tangga Deposit"
          value={summary.households_with_deposit}
          subtitle={`Total ${formatCurrency(summary.total_deposit_amount)}`}
          icon="TrendingUp"
          variant="success"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Pembayaran Terbaru
            </CardTitle>
            <Link href="/admin/history">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <EmptyState
                icon="Receipt"
                title="Belum Ada Pembayaran"
                description="Pembayaran akan muncul di sini setelah dicatat"
              />
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {payment.households?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDate(payment.transaction_date)}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      +{formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Households with Most Debt */}
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Rumah Tangga Berhutang
            </CardTitle>
            <Link href="/admin/warga">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {householdsWithDebt.length === 0 ? (
              <EmptyState
                icon="TrendingUp"
                title="Tidak Ada Hutang"
                description="Semua rumah tangga sudah lunas atau memiliki deposit"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {householdsWithDebt.map((household) => (
                    <TableRow key={household?.id}>
                      <TableCell>
                        <Link
                          href={`/admin/warga/${household.id}`}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {household.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <BalanceDisplay
                          balance={household.balance}
                          size="sm"
                          showBadge={false}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
