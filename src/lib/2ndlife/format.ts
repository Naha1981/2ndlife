/**
 * 2ndLife — formatting & domain utilities
 * SA-specific: Rand currency, Africa/Johannesburg timezone, E.164 phones.
 * ONE money formatter everywhere: space thousands, dot decimals.
 * Example: 1248750 → "R1 248 750", 150 with decimals → "R150.00"
 */

function formatMoney(amount: number, decimals: boolean): string {
  const fixed = decimals ? amount.toFixed(2) : Math.round(amount).toString();
  const [intPart, decPart] = fixed.split(".");
  // Space as thousands separator
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return "R" + withSpaces + (decPart ? "." + decPart : "");
}

export function formatZAR(amount: number, opts?: { decimals?: boolean }): string {
  return formatMoney(amount, opts?.decimals ?? false);
}

export function formatZARCompact(amount: number): string {
  if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `R${(amount / 1_000).toFixed(1)}K`;
  return formatZAR(amount);
}

export function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function normalizeSAPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("27")) return `+${digits}`;
  if (digits.startsWith("0")) return `+27${digits.slice(1)}`;
  return `+${digits}`;
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}***@${domain}`;
}
