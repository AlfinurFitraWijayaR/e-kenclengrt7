import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { formatDate, getMonthName } from "@/lib/format";
import { DeletePeriodButton } from "./delete-period-button";
import { AddPeriodButton, EmptyPeriodAction } from "./period-actions";

export const metadata: Metadata = {
  title: "Periode Pengumpulan - E-Kencleng RT 7",
  description: "Kelola periode pengumpulan iuran",
};

export default async function PeriodsPage() {
  const periods = await getCollectionPeriods();

  return (
    <DashboardLayout>
      <PageHeader
        title="Periode Pengumpulan"
        description="Kelola periode pengumpulan iuran bulanan"
        action={<AddPeriodButton />}
      />

      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon="Calendar"
              title="Belum Ada Periode"
              description="Buat periode pertama untuk mulai mencatat pembayaran bulanan"
              action={<EmptyPeriodAction />}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Periode</TableHead>
                  <TableHead className="font-semibold">Tanggal Mulai</TableHead>
                  <TableHead className="font-semibold">Tanggal Akhir</TableHead>
                  <TableHead className="font-semibold">Catatan</TableHead>
                  <TableHead className="font-semibold text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow
                    key={period.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {getMonthName(period.month)} {period.year}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(period.start_date)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(period.end_date)}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {period.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DeletePeriodButton periodId={period.id} />
                      </div>
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
