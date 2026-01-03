import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { PeriodForm } from "../period-form";

export const metadata: Metadata = {
  title: "Periode Baru - E-Kencleng RT 7",
  description: "Buat periode pengumpulan baru",
};

export default function NewPeriodPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Periode Baru"
        description="Buat periode pengumpulan iuran baru"
      />

      <PeriodForm />
    </DashboardLayout>
  );
}
