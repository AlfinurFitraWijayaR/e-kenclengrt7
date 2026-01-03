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
import { HouseholdWithBalance } from "@/lib/types/database";

interface QuickPaymentModalProps {
  household: HouseholdWithBalance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickHistoryModal({
  household,
  isOpen,
  onClose,
}: QuickPaymentModalProps) {
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
      <DialogContent className="sm:max-w-md mx-auto rounded-2xl">
        {/* Title */}
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Histori Pembayaran {household.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Household Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-500">
              Kela lieur dek kmha ie konsep na waluh
            </p>
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
