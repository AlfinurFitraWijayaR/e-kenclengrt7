"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordPayment } from "@/lib/actions/transactions";
import { CollectionPeriod } from "@/lib/types/database";
import { formatCurrency, getMonthName } from "@/lib/format";
import { Loader2, Plus, Wallet } from "lucide-react";

interface PaymentDialogProps {
  householdId: string;
  householdName: string;
  periods: CollectionPeriod[];
}

const quickAmounts = [3000, 3500, 4000, 5000, 6000];

export function PaymentDialog({
  householdId,
  householdName,
  periods,
}: PaymentDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [periodId, setPeriodId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Jumlah pembayaran harus lebih dari 0");
      setIsLoading(false);
      return;
    }

    try {
      await recordPayment(
        householdId,
        numAmount,
        periodId || null,
        description || undefined
      );

      setIsOpen(false);
      setAmount("");
      setPeriodId("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Catat Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Catat Pembayaran
          </DialogTitle>
          <DialogDescription>
            Catat pembayaran iuran untuk <strong>{householdName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran (IDR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              className="h-12 rounded-xl text-lg font-mono"
            />
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(qa.toString())}
                  className="px-3 py-1 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {formatCurrency(qa)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Periode (Opsional)</Label>
            <select
              id="period"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Tidak ada periode --</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {getMonthName(period.month)} {period.year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Contoh: Iuran bulan Januari"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Pembayaran"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
