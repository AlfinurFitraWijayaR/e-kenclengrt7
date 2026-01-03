import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { HouseholdForm } from "../household-form";

export const metadata: Metadata = {
  title: "Tambah Rumah Tangga - E-Kencleng RT 7",
  description: "Tambah rumah tangga baru",
};

export default function NewHouseholdPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Tambah Rumah Tangga"
        description="Daftarkan rumah tangga baru ke sistem iuran"
      />

      <HouseholdForm />
    </DashboardLayout>
  );
}
