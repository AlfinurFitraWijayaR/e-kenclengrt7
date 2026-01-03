import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/dashboard-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { ExportForm } from "./export-form";
import { ExportInfo } from "./export-info";

export const metadata: Metadata = {
  title: "Ekspor Laporan - E-Kencleng RT 7",
  description: "Ekspor laporan pengumpulan iuran ke PDF",
};

export default async function ExportPage() {
  const periods = await getCollectionPeriods();

  return (
    <DashboardLayout>
      <PageHeader
        title="Ekspor Laporan PDF"
        description="Unduh laporan pengumpulan iuran dalam format PDF"
      />

      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon="FileText"
              title="Belum Ada Periode"
              description="Buat periode pengumpulan terlebih dahulu untuk mengekspor laporan"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Pilih Periode untuk Diekspor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExportForm periods={periods} />
            </CardContent>
          </Card>

          <ExportInfo />
        </div>
      )}
    </DashboardLayout>
  );
}
