"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

export function AddHouseholdButton() {
  return (
    <Link href="/admin/warga/new">
      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
        <Plus className="w-4 h-4 mr-2" />
        Tambah Baru
      </Button>
    </Link>
  );
}

export function EmptyHouseholdAction() {
  return (
    <Link href="/admin/warga/new">
      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
        <Plus className="w-4 h-4 mr-2" />
        Tambah Warga Baru
      </Button>
    </Link>
  );
}

interface HouseholdActionsProps {
  householdId: string;
}

export function HouseholdActions({ householdId }: HouseholdActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/warga/${householdId}`}>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
          Lihat
        </Button>
      </Link>
    </div>
  );
}
