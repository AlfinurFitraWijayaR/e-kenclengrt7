"use client";

import { Badge } from "@/components/ui/badge";
import { formatBalance } from "@/lib/format";

interface BalanceDisplayProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  light?: boolean;
}

export function BalanceDisplay({
  balance,
  size = "md",
  showBadge = true,
  light = false,
}: BalanceDisplayProps) {
  const { label, status } = formatBalance(balance);

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-bold",
  };

  const textColor = light
    ? "text-white"
    : status === "debt"
    ? "text-red-600"
    : status === "deposit"
    ? "text-emerald-600"
    : "text-slate-600";

  if (showBadge) {
    const badgeVariant =
      status === "debt"
        ? "destructive"
        : status === "deposit"
        ? "default"
        : "secondary";

    return (
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <span className={`${textSizes[size]} ${textColor} font-mono`}>
          {label}
        </span>
        <Badge variant={badgeVariant} className="capitalize">
          {status === "debt"
            ? "Hutang"
            : status === "deposit"
            ? "Nyimpen"
            : "Lunas"}
        </Badge>
      </div>
    );
  }

  return (
    <span className={`${textSizes[size]} ${textColor} font-mono`}>{label}</span>
  );
}

interface StatusBadgeProps {
  status: "PAID" | "UNPAID" | "active" | "inactive";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    PAID: {
      label: "Lunas",
      variant: "default" as const,
      className: "bg-emerald-500 hover:bg-emerald-600",
    },
    UNPAID: {
      label: "Belum Lunas",
      variant: "destructive" as const,
      className: "",
    },
    active: {
      label: "Aktif",
      variant: "default" as const,
      className: "bg-emerald-500 hover:bg-emerald-600",
    },
    inactive: {
      label: "Nonaktif",
      variant: "secondary" as const,
      className: "",
    },
  };

  const { label, variant, className } = config[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
