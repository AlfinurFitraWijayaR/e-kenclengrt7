import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { BalanceDisplay, StatusBadge } from "@/components/balance-display";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getHouseholdsWithBalance } from "@/lib/actions/households";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import {
  HouseholdActions,
  AddHouseholdButton,
  EmptyHouseholdAction,
} from "./household-actions";

export const metadata: Metadata = {
  title: "Daftar Warga - E-Kencleng RT 7",
  description: "Daftar rumah tangga RT 7",
};

export default async function AdminWargaPage() {
  const households = await getHouseholdsWithBalance();

  return (
    <DashboardLayout>
      <PageHeader
        title="Daftar Nama Warga"
        description={`${households.length} warga terdaftar`}
        action={<AddHouseholdButton />}
      />

      {households.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon="Users"
              title="Belum Ada Warga"
              description="Tambahkan warga pertama untuk memulai pencatatan iuran"
              action={<EmptyHouseholdAction />}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Nama</TableHead>
                  <TableHead className="font-semibold">Mulai Iuran</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Saldo</TableHead>
                  <TableHead className="font-semibold text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {households.map((household) => (
                  <TableRow
                    key={household.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell>
                      <Link
                        href={`/admin/warga/${household.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {household.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(household.contribution_start_date)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={household.status} />
                    </TableCell>
                    <TableCell>
                      <BalanceDisplay
                        balance={household.balance}
                        size="sm"
                        showBadge={true}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <HouseholdActions householdId={household.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
