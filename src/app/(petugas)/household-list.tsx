"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Wallet, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { HouseholdWithBalance } from "@/lib/types/database";
import { QuickPaymentModal } from "./quick-payment-modal";
import { getCollectionPeriods } from "@/lib/actions/periods";
import { CollectionPeriod } from "@/lib/types/database";

interface HouseholdListProps {
  households: HouseholdWithBalance[];
}

export function HouseholdList({ households }: HouseholdListProps) {
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
              className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                household.balance < 0
                  ? "border-l-4 border-l-red-500 bg-red-50/50"
                  : household.balance > 0
                  ? "border-l-4 border-l-green-500 bg-green-50/50"
                  : "border-l-4 border-l-slate-300"
              }`}
              onClick={() => handleHouseholdClick(household)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {household.name}
                    </h3>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        household.balance < 0
                          ? "text-red-600"
                          : household.balance > 0
                          ? "text-green-600"
                          : "text-slate-500"
                      }`}
                    >
                      {formatCurrency(Math.abs(household.balance))}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {household.balance < 0
                        ? "Hutang"
                        : household.balance > 0
                        ? "Nyimpen"
                        : "Lunas"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <QuickPaymentModal
        household={selectedHousehold}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        periods={periods}
      />
    </>
  );
}
