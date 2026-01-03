"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  createCollectionPeriod,
  updateCollectionPeriod,
} from "@/lib/actions/periods";
import { CollectionPeriod } from "@/lib/types/database";
import { getMonthName } from "@/lib/format";
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";

interface PeriodFormProps {
  period?: CollectionPeriod;
}

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1),
}));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export function PeriodForm({ period }: PeriodFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(
    period?.month || new Date().getMonth() + 1
  );
  const [year, setYear] = useState(period?.year || currentYear);

  const isEdit = !!period;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const notes = formData.get("notes") as string;

    try {
      if (isEdit) {
        await updateCollectionPeriod(period.id, { notes });
      } else {
        await createCollectionPeriod(month, year, notes || undefined);
      }

      router.push("/admin/periode");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-xl border-slate-200/50 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="month">Bulan</Label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isEdit && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-500">Periode</p>
              <p className="font-semibold text-slate-900">
                {getMonthName(period.month)} {period.year}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Contoh: Pengumpulan rutin bulanan"
              defaultValue={period?.notes || ""}
              className="h-12 rounded-xl"
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 pt-4">
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
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update" : "Simpan"}
              </>
            )}
          </Button>
          <Link href="/admin/periode">
            <Button type="button" variant="outline">
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
