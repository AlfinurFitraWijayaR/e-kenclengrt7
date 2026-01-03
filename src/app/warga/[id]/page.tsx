import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PetugasLayout } from "@/components/layout/petugas-sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getHouseholdWithBalance } from "@/lib/actions/households";
import { getHouseholdTransactionsForOfficer } from "@/app/(petugas)/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HouseholdPaymentButton } from "./payment-button";

export const metadata: Metadata = {
  title: "Detail Warga - E-Kencleng RT 7",
  description: "Detail dan riwayat transaksi warga",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WargaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [household, transactions] = await Promise.all([
    getHouseholdWithBalance(id),
    getHouseholdTransactionsForOfficer(id),
  ]);

  if (!household) {
    notFound();
  }

  return (
    <PetugasLayout>
      <div className="mb-6">
        <Link href="/warga">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <PageHeader
        title={household.name}
        description="Detail dan riwayat transaksi"
      />

      {/* Balance Card */}
      <Card
        className={`mb-6 border-2 ${
          household.balance < 0
            ? "border-red-200 bg-red-50"
            : household.balance > 0
            ? "border-green-200 bg-green-50"
            : "border-slate-200"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Saldo Saat Ini</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  household.balance < 0
                    ? "text-red-600"
                    : household.balance > 0
                    ? "text-green-600"
                    : "text-slate-600"
                }`}
              >
                {household.balance < 0 && "-"}
                {formatCurrency(Math.abs(household.balance))}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {household.balance < 0
                  ? "Hutang yang harus dibayar"
                  : household.balance > 0
                  ? "Saldo deposit"
                  : "Lunas"}
              </p>
            </div>
            <HouseholdPaymentButton household={household} />
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Belum ada transaksi untuk warga ini
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    transaction.type === "CREDIT" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "CREDIT"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "CREDIT" ? (
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">
                      {transaction.type === "CREDIT" ? "Pembayaran" : "Tagihan"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(transaction.transaction_date)}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {transaction.description}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PetugasLayout>
  );
}
