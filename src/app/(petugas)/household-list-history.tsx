"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HouseholdWithBalance } from "@/lib/types/database";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { CollectionPeriod } from "@/lib/types/database";
import { QuickHistoryModal } from "./quick-history-modal";

interface HouseholdListProps {
  households: HouseholdWithBalance[];
}

export function HouseholdListHistory({ households }: HouseholdListProps) {
  const [periods, setPeriods] = useState<CollectionPeriod[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdWithBalance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPeriods = async () => {
      const data = await getCollectionPeriods();
      if (isMounted) {
        setPeriods(data);
      }
    };

    fetchPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHouseholds = useMemo(() => {
    if (!searchQuery.trim()) return households;
    const query = searchQuery.toLowerCase();
    return households.filter((h) => h.name.toLowerCase().includes(query));
  }, [households, searchQuery]);

  const handleHouseholdClick = (household: HouseholdWithBalance) => {
    setSelectedHousehold(household);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHousehold(null);
  };

  const sortedHouseholds = useMemo(() => {
    return [...filteredHouseholds].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [filteredHouseholds]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari nama warga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Household List */}
      <div className="space-y-3">
        {sortedHouseholds.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery
                  ? "Tidak ada warga yang ditemukan"
                  : "Belum ada data warga"}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedHouseholds.map((household) => (
            <Card
              key={household.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              onClick={() => handleHouseholdClick(household)}
            >
              <CardContent className="px-3 py-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {household.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Payment Modal */}
      <QuickHistoryModal
        household={selectedHousehold}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
