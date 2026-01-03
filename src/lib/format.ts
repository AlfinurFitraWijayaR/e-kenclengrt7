/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format balance with explicit status (Debt/Deposit)
 */
export function formatBalance(balance: number): {
  formatted: string;
  status: "debt" | "deposit" | "zero";
  label: string;
} {
  if (balance < 0) {
    return {
      formatted: formatCurrency(Math.abs(balance)),
      status: "debt",
      label: `−${formatCurrency(Math.abs(balance))} (Hutang)`,
    };
  } else if (balance > 0) {
    return {
      formatted: formatCurrency(balance),
      status: "deposit",
      label: `+${formatCurrency(balance)} (Nyimpen)`,
    };
  } else {
    return {
      formatted: formatCurrency(0),
      status: "zero",
      label: "Rp 0 (Lunas)",
    };
  }
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format date to short format
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] || "";
}

/**
 * Calculate days between two dates
 */
export function daysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get first day of month in YYYY-MM-DD format
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, "0")}-01`;
}

/**
 * Get last day of month in YYYY-MM-DD format
 */
export function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${month.toString().padStart(2, "0")}-${lastDay
    .toString()
    .padStart(2, "0")}`;
}
