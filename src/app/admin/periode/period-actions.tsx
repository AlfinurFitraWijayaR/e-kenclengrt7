"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

export function AddPeriodButton() {
  return (
    <Link href="/admin/periode/new">
      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
        <Plus className="w-4 h-4 mr-2" />
        Periode Baru
      </Button>
    </Link>
  );
}

export function EmptyPeriodAction() {
  return (
    <Link href="/admin/periode/new">
      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
        <Plus className="w-4 h-4 mr-2" />
        Buat Periode
      </Button>
    </Link>
  );
}

interface PeriodActionsProps {
  periodId: string;
}

export function PeriodActions({ periodId }: PeriodActionsProps) {
  return (
    <>
      <Link href={`/admin/history?period=${periodId}`}>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </Link>
    </>
  );
}
