"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  History,
  FileText,
  Menu,
  X,
  LogOut,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/warga", label: "Daftar Warga", icon: Users },
  { href: "/admin/periode", label: "Periode", icon: Calendar },
  { href: "/admin/history", label: "Riwayat Transaksi", icon: History },
  { href: "/admin/export", label: "Ekspor PDF", icon: FileText },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  exact?: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-slate-200"
      >
        <Menu size={24} className="text-slate-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={20} className="text-slate-500" />
          </button>
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">E-Kencleng</h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              isActive={
                item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
