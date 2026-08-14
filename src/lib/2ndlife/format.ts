/**
 * 2ndLife — formatting & domain utilities
 * SA-specific: Rand currency, Africa/Johannesburg timezone, E.164 phones.
 */

export function formatZAR(amount: number, opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals ? 2 : 0;
  return (
    "R" +
    amount.toLocaleString("en-ZA", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export function formatZARCompact(amount: number): string {
  if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `R${(amount / 1_000).toFixed(1)}K`;
  return formatZAR(amount);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-ZA");
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
