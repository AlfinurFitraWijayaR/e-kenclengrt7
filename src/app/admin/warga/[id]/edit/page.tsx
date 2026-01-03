import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { HouseholdForm } from "../../household-form";
import { getHouseholdWithBalance } from "@/lib/actions/households";

export const metadata: Metadata = {
  title: "Edit Rumah Tangga - E-Kencleng RT 7",
};

interface EditHouseholdPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHouseholdPage({
  params,
}: EditHouseholdPageProps) {
  const { id } = await params;
  const household = await getHouseholdWithBalance(id);

  if (!household) {
    notFound();
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Edit Rumah Tangga"
        description={`Mengedit data ${household.name}`}
      />

      <HouseholdForm household={household} />
    </DashboardLayout>
  );
}
