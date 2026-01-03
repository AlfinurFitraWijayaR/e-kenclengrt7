"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, History, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/warga", label: "Warga", icon: Users },
  { href: "/history", label: "Riwayat", icon: History },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}

function NavLink({ href, label, icon: Icon, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${
        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span
        className={`text-xs font-medium ${isActive ? "text-blue-600" : ""}`}
      >
        {label}
      </span>
    </Link>
  );
}

export function PetugasBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            isActive={
              item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
            }
          />
        ))}
        <form action={signOut}>
          <button
            type="submit"
            className="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-500"
          >
            <LogOut size={24} strokeWidth={2} />
            <span className="text-xs font-medium">Keluar</span>
          </button>
        </form>
      </div>
    </nav>
  );
}

export function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="pb-[80px] min-h-screen">
        <div className="p-4">{children}</div>
      </main>
      <PetugasBottomNav />
    </div>
  );
}

// Keep the old sidebar for backwards compatibility if needed
export function PetugasSidebar() {
  return <PetugasBottomNav />;
}
