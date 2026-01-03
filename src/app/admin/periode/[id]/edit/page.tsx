import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { getCollectionPeriod } from "@/lib/actions/periods";
import { getMonthName } from "@/lib/format";
import { PeriodForm } from "../../period-form";

export const metadata: Metadata = {
  title: "Edit Periode - E-Kencleng RT 7",
};

interface EditPeriodPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPeriodPage({ params }: EditPeriodPageProps) {
  const { id } = await params;
  const period = await getCollectionPeriod(id);

  if (!period) {
    notFound();
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Edit Periode"
        description={`Mengedit periode ${getMonthName(period.month)} ${
          period.year
        }`}
      />

      <PeriodForm period={period} />
    </DashboardLayout>
  );
}
