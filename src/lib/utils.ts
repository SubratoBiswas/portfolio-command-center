import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import type { RAG, Status, Priority, Severity } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------------------------------------------------------------------
// Formatting
// -----------------------------------------------------------------------------

export const fmtCurrency = (n: number, opts: { compact?: boolean } = {}) => {
  if (opts.compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${(n / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
};

export const fmtPct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

export const fmtNum = (n: number) =>
  new Intl.NumberFormat('en-US').format(n);

export const fmtDate = (iso: string, pattern = 'MMM d, yyyy') => {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
};

export const fmtRelative = (iso: string) => {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
};

export const daysFromNow = (iso: string) => {
  try {
    return differenceInDays(parseISO(iso), new Date());
  } catch {
    return 0;
  }
};

// -----------------------------------------------------------------------------
// Status / RAG logic
// -----------------------------------------------------------------------------

export function utilizationRag(pct: number): RAG {
  if (pct <= 75) return 'green';
  if (pct <= 90) return 'yellow';
  if (pct <= 100) return 'orange';
  return 'red';
}

export const ragColor: Record<RAG, string> = {
  green: 'bg-ok text-white',
  yellow: 'bg-amber-200 text-amber-900',
  orange: 'bg-orange-300 text-orange-950',
  red: 'bg-crit text-white',
};

export const ragChip: Record<RAG, string> = {
  green: 'bg-ok-bg text-ok',
  yellow: 'bg-amber-100 text-amber-800',
  orange: 'bg-orange-100 text-orange-900',
  red: 'bg-crit-bg text-crit',
};

export const statusLabel: Record<Status, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  blocked: 'Blocked',
  at_risk: 'At risk',
  on_track: 'On track',
  done: 'Done',
  cancelled: 'Cancelled',
  on_hold: 'On hold',
};

export const statusTone: Record<Status, string> = {
  not_started: 'bg-line-subtle text-ink-muted',
  in_progress: 'bg-info-bg text-info',
  blocked: 'bg-crit-bg text-crit',
  at_risk: 'bg-amber-100 text-amber-800',
  on_track: 'bg-ok-bg text-ok',
  done: 'bg-line text-ink-soft',
  cancelled: 'bg-line text-ink-subtle line-through',
  on_hold: 'bg-amber-50 text-amber-700',
};

export const priorityTone: Record<Priority, string> = {
  p0: 'bg-crit text-white',
  p1: 'bg-crit-bg text-crit',
  p2: 'bg-amber-100 text-amber-800',
  p3: 'bg-line text-ink-muted',
};

export const priorityLabel: Record<Priority, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
};

export const severityTone: Record<Severity, string> = {
  low: 'bg-line-subtle text-ink-muted',
  medium: 'bg-info-bg text-info',
  high: 'bg-amber-100 text-amber-800',
  critical: 'bg-crit-bg text-crit',
};

// -----------------------------------------------------------------------------
// Misc
// -----------------------------------------------------------------------------

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function pluralize(n: number, singular: string, plural?: string) {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

export function groupBy<T, K extends string | number>(
  arr: T[],
  key: (t: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function sumBy<T>(arr: T[], key: (t: T) => number): number {
  return arr.reduce((a, t) => a + key(t), 0);
}

export const ISO_WEEK_START = (d: Date): string => {
  const dt = new Date(d);
  const day = dt.getDay() || 7;
  if (day !== 1) dt.setHours(-24 * (day - 1));
  return dt.toISOString().slice(0, 10);
};

export function weeksFromNow(count: number): string[] {
  const out: string[] = [];
  const monday = new Date();
  const dow = monday.getDay() || 7;
  monday.setDate(monday.getDate() - (dow - 1));
  for (let i = 0; i < count; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i * 7);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
