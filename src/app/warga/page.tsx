import { Metadata } from "next";
import { PetugasLayout } from "@/components/layout/petugas-sidebar";
import { PageHeader } from "@/components/dashboard-components";
import { getHouseholdsWithBalance } from "@/lib/actions/households";
import { HouseholdListHistory } from "../(petugas)/household-list-history";

export const metadata: Metadata = {
  title: "Daftar Warga - E-Kencleng RT 7",
  description: "Daftar warga untuk petugas penagihan",
};

export default async function WargaPage() {
  const households = await getHouseholdsWithBalance();

  return (
    <PetugasLayout>
      <PageHeader
        title="Daftar Warga"
        description="Daftar warga yang terdaftar"
      />

      <HouseholdListHistory households={households} />
    </PetugasLayout>
  );
}
