import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { BalanceDisplay, StatusBadge } from "@/components/balance-display";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
  console.log(households);

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
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Nama</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">
                Tagihan
              </TableHead>
              {/* <TableHead className="font-semibold text-right">Aksi</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {households.map((household) => (
              <TableRow key={household.id}>
                <TableCell>
                  <Link
                    href={`/admin/warga/${household.id}`}
                    className="font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                  >
                    {household.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={household.status} />
                </TableCell>
                <TableCell className="text-right">
                  <BalanceDisplay balance={household.balance} size="sm" />
                </TableCell>
                {/* <TableCell className="text-right">
                  <HouseholdActions householdId={household.id} />
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}
