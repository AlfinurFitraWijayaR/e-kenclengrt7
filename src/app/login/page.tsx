import { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk - E-Kencleng RT 7",
  description: "Masuk ke sistem pengelolaan iuran warga RT 7",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8">
          <h2 className="text-xl text-center font-semibold text-slate-900 mb-2">
            E-Kencleng RT 7
          </h2>

          <LoginForm searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
