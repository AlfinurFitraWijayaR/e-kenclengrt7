"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer, Info } from "lucide-react";

export function ExportInfo() {
  return (
    <Card className="border-slate-200/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Cara Menyimpan PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Isi Laporan
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Daftar warga dan status pembayaran</li>
            <li>• Total kewajiban dan pembayaran per periode</li>
            <li>• Ringkasan jumlah lunas dan belum lunas</li>
            <li>• Tanggal dan periode laporan</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Langkah-langkah
          </h4>
          <ol className="text-sm text-blue-700 space-y-2">
            <li>
              <strong>1.</strong> Pilih periode lalu klik &quot;Buka
              Laporan&quot;
            </li>
            <li>
              <strong>2.</strong> Laporan akan terbuka di tab baru
            </li>
            <li>
              <strong>3.</strong> Klik tombol &quot;Cetak / Simpan PDF&quot; di
              pojok kanan bawah
            </li>
            <li>
              <strong>4.</strong> Pilih &quot;Save as PDF&quot; pada dialog
              print
            </li>
          </ol>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>💡 Tips:</strong> Gunakan shortcut{" "}
            <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-xs">
              Ctrl+P
            </kbd>{" "}
            (Windows) atau{" "}
            <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-xs">
              ⌘+P
            </kbd>{" "}
            (Mac) untuk membuka dialog print dengan cepat.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
