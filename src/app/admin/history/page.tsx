import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import {
  getCollectionPeriods,
  getCollectionPeriod,
  getPeriodReport,
} from "@/lib/actions/periods";
import { HistoryContent } from "./history-content";

export const metadata: Metadata = {
  title: "Riwayat Penarikan - E-Kencleng RT 7",
  description: "Riwayat penarikan iuran per periode",
};

export default async function HistoryPage() {
  const periods = await getCollectionPeriods();

  // Get initial period data (most recent one)
  const initialPeriodId = periods[0]?.id;
  const initialPeriod = initialPeriodId
    ? await getCollectionPeriod(initialPeriodId)
    : null;

  const initialReport = initialPeriodId
    ? await getPeriodReport(initialPeriodId)
    : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Riwayat Penarikan"
        description="Lihat status penarikan per periode"
      />

      <HistoryContent
        periods={periods}
        initialPeriod={initialPeriod}
        initialReport={initialReport}
      />
    </DashboardLayout>
  );
}
