import { Metadata } from "next";
import { PetugasLayout } from "@/components/layout/petugas-sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { getHouseholdsWithBalance } from "@/lib/actions/households";
import { formatDate } from "@/lib/format";
import { HouseholdList } from "@/app/(petugas)/household-list";
import { getUserProfile } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard Petugas - E-Kencleng RT 7",
  description: "Dashboard petugas penagihan iuran warga RT 7",
};

export default async function PetugasDashboardPage() {
  const households = await getHouseholdsWithBalance();
  const username = (await getUserProfile())?.full_name;

  return (
    <PetugasLayout>
      <PageHeader
        title="Dashboard"
        description={
          <>
            Wilujeung Sumping <span className="font-semibold">{username}</span>,
            Berikut ringkasan iuran warga per {formatDate(new Date())}
          </>
        }
      />

      <HouseholdList households={households} />
    </PetugasLayout>
  );
}
