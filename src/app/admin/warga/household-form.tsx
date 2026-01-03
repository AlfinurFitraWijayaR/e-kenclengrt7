"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createHousehold, updateHousehold } from "@/lib/actions/households";
import { Household } from "@/lib/types/database";
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";

interface HouseholdFormProps {
  household?: Household;
}

export function HouseholdForm({ household }: HouseholdFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!household;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const contribution_start_date = formData.get(
      "contribution_start_date"
    ) as string;
    const status =
      (formData.get("status") as "active" | "inactive") || "active";

    try {
      if (isEdit) {
        await updateHousehold(household.id, {
          name,
          contribution_start_date,
          status,
        });
      } else {
        await createHousehold({
          name,
          contribution_start_date,
          status,
        });
      }

      router.push("/admin/warga");
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

          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Contoh: Pak Budi"
              defaultValue={household?.name || ""}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution_start_date">Tanggal Mulai Iuran</Label>
            <Input
              id="contribution_start_date"
              name="contribution_start_date"
              type="date"
              defaultValue={
                household?.contribution_start_date ||
                new Date().toISOString().split("T")[0]
              }
              required
              className="h-12 rounded-xl"
            />
            <p className="text-sm text-slate-500">
              Kewajiban iuran dihitung sejak tanggal ini (500 IDR/hari)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={household?.status || "active"}
              className="w-full h-12 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
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
                <Save className="w-4 h-4" />
                {isEdit ? "Update" : "Simpan"}
              </>
            )}
          </Button>
          <Link href="/admin/warga">
            <Button type="button" variant="outline">
              <X className="w-4 h-4" />
              Batal
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
