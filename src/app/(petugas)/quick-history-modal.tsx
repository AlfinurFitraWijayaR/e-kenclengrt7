"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCurrency, getMonthName } from "@/lib/format";
import { CollectionPeriod, HouseholdWithBalance } from "@/lib/types/database";

interface QuickPaymentModalProps {
  household: HouseholdWithBalance | null;
  isOpen: boolean;
  onClose: () => void;
  periods: CollectionPeriod[];
}

function getDefaultPeriodId(periods: CollectionPeriod[]): string {
  if (!periods || periods.length === 0) return "";
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentPeriod = periods.find(
    (period) => period.month === currentMonth && period.year === currentYear
  );
  return currentPeriod?.id || "";
}

export function QuickHistoryModal({
  household,
  isOpen,
  onClose,
  periods,
}: QuickPaymentModalProps) {
  const [periodId, setPeriodId] = useState<string>(() =>
    getDefaultPeriodId(periods)
  );
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      onClose();
    }
  };

  if (!household) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        {/* Title */}
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Histori Pembayaran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Household Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-500">Nama</p>
            <p className="text-lg font-semibold text-slate-900">
              {household.name}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Jumlah yang harus dibayar
              </p>
              <p
                className={`text-xl font-bold ${
                  household.balance < 0
                    ? "text-red-600"
                    : household.balance > 0
                    ? "text-green-600"
                    : "text-slate-600"
                }`}
              >
                {formatCurrency(Math.abs(household.balance))}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {household.balance < 0
                  ? "Hutang"
                  : household.balance > 0
                  ? "Nyimpen"
                  : "Lunas"}
              </p>
            </div>
          </div>

          {/* Periode Input */}
          <div className="space-y-2">
            <Label htmlFor="period">Bulan Penarikan</Label>
            <select
              required
              id="period"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Pilih bulan --</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {getMonthName(period.month)} {period.year}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
