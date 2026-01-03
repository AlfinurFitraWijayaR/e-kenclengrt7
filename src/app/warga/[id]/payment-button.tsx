"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseholdWithBalance } from "@/lib/types/database";
import { QuickHistoryModal } from "@/app/(petugas)/quick-history-modal";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { CollectionPeriod } from "@/lib/types/database";

interface HouseholdPaymentButtonProps {
  household: HouseholdWithBalance;
}

export function HouseholdPaymentButton({
  household,
}: HouseholdPaymentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periods, setPeriods] = useState<CollectionPeriod[]>([]);

  useEffect(() => {
    const fetchPeriods = async () => {
      const data = await getCollectionPeriods();
      setPeriods(data);
    };

    fetchPeriods();
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
        size="lg"
      >
        <Wallet className="w-5 h-5" />
        Catat Bayar
      </Button>

      <QuickHistoryModal
        household={household}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        periods={periods}
      />
    </>
  );
}
