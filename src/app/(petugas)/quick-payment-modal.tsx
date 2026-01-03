"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Wallet, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, getMonthName } from "@/lib/format";
import { CollectionPeriod, HouseholdWithBalance } from "@/lib/types/database";
import { recordPaymentAsOfficer } from "@/app/(petugas)/actions";

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

export function QuickPaymentModal({
  household,
  isOpen,
  onClose,
  periods,
}: QuickPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [periodId, setPeriodId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAmount("");
      setIsSuccess(false);
      setError(null);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!periods || periods.length === 0) return;
    if (periodId) return;

    const defaultPeriodId = getDefaultPeriodId(periods);
    setPeriodId(defaultPeriodId);
  }, [isOpen, periods]);

  const handleSubmit = () => {
    if (!household || !amount || !periodId) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Masukkan jumlah yang valid");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await recordPaymentAsOfficer(household.id, numAmount, periodId);
        setIsSuccess(true);
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mencatat pembayaran"
        );
      }
    });
  };

  const quickAmounts = [3000, 3500, 4000, 5000, 6000];
  if (!household) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg mx-auto rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Catat Pembayaran
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900">
              Pembayaran Berhasil!
            </p>
            <p className="text-slate-500 mt-1">
              {formatCurrency(parseFloat(amount))} telah dicatat
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Household Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-500">
                  Yang harus dibayar oleh{" "}
                  <span className="font-semibold text-slate-900">
                    {household.name}
                  </span>
                </p>
                <p
                  className={`text-lg font-bold ${
                    household.balance < 0
                      ? "text-red-600"
                      : household.balance > 0
                      ? "text-green-600"
                      : "text-slate-600"
                  }`}
                >
                  {formatCurrency(Math.abs(household.balance))}
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base">
                  Input Pembayaran
                </Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    amount
                      ? new Intl.NumberFormat("id-ID").format(parseInt(amount))
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\./g, "");
                    if (/^\d*$/.test(rawValue)) {
                      setAmount(rawValue);
                    }
                  }}
                  className="h-14 text-xl font-semibold text-center rounded-xl"
                  disabled={isPending}
                />
              </div>

              {/* Periode Input */}
              <div className="space-y-2">
                <Label htmlFor="period">Bulan Penarikan</Label>
                <select
                  required
                  disabled
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

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={isPending}
                  >
                    {formatCurrency(quickAmount)}
                  </Button>
                ))}
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
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={isPending || !amount || !periodId}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Pembayaran"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
