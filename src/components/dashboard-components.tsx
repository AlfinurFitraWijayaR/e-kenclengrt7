"use client";

import { ReactNode } from "react";
import {
  Users,
  Wallet,
  TrendingDown,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Home,
  Calendar,
  FileText,
  History,
  LucideIcon,
} from "lucide-react";

// Map icon names to actual components
const iconMap: Record<string, LucideIcon> = {
  Users,
  Wallet,
  TrendingDown,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Home,
  Calendar,
  FileText,
  History,
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string; // Changed from LucideIcon to string
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = "default",
}: StatCardProps) {
  const Icon = iconMap[icon] || Users;

  const variants = {
    default: {
      bg: "bg-gradient-to-br from-slate-500 to-slate-700",
      shadow: "shadow-slate-500/25",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    danger: {
      bg: "bg-gradient-to-br from-red-500 to-rose-600",
      shadow: "shadow-red-500/25",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/25",
    },
  };

  const { bg, shadow } = variants[variant];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${
                    trend === "up"
                      ? "text-emerald-600"
                      : trend === "down"
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shadow-lg ${shadow}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          {title}
        </h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: string; // Changed from LucideIcon to string
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = iconMap[icon] || Users;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-center max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
