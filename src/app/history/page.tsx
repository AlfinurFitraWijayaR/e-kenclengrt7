import { Metadata } from "next";
import { PetugasLayout } from "@/components/layout/petugas-sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { Card, CardContent } from "@/components/ui/card";
import { getRecentTransactionsForOfficer } from "@/app/(petugas)/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Riwayat Transaksi - E-Kencleng RT 7",
  description: "Riwayat transaksi petugas penagihan",
};

export default async function HistoryPage() {
  const transactions = await getRecentTransactionsForOfficer(100);

  return (
    <PetugasLayout>
      <PageHeader
        title="Riwayat Transaksi"
        description="Daftar seluruh transaksi iuran warga"
      />

      {transactions.length === 0 ? (
        <EmptyState
          icon="History"
          title="Belum Ada Transaksi"
          description="Transaksi akan muncul di sini setelah dicatat"
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card
              key={transaction.id}
              className={`border-l-4 ${
                transaction.type === "CREDIT"
                  ? "border-l-green-500 bg-green-50/30"
                  : "border-l-red-500 bg-red-50/30"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
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
                    <p className="font-semibold text-slate-900 truncate">
                      {transaction.households?.name || "Unknown"}
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
                  <div className="text-right">
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
                    <p
                      className={`text-xs ${
                        transaction.type === "CREDIT"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "CREDIT" ? "Bayar" : "Tagihan"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PetugasLayout>
  );
}
