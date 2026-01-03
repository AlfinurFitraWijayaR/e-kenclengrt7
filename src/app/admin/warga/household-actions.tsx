"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit } from "lucide-react";

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
        Tambah Rumah Tangga
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
        </Button>
      </Link>
      <Link href={`/admin/warga/${householdId}/edit`}>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
