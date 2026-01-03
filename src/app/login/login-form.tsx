"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  searchParams: Promise<{ message?: string }>;
}

export function LoginForm({ searchParams }: LoginFormProps) {
  const params = use(searchParams);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {params?.message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {params.message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nama@gmail.com"
          required
          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            required
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all"
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </div>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
