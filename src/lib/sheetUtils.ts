// =============================================================================
// Pure helpers for the Spreadsheet workbench grid — value <-> cell conversions.
// Unit-tested in sheetUtils.test.ts.
// =============================================================================

export type CellType =
  | 'text' | 'number' | 'currency' | 'date' | 'select' | 'stars' | 'tags' | 'check' | 'readonly';

export interface SelectOption { value: string; label: string; color?: string }

/** Convert a stored value into the string shown in an editor input. */
export function toDraft(type: CellType, v: any): string {
  if (v == null) return '';
  if (type === 'date') return String(v).split('T')[0];
  if (type === 'tags') return Array.isArray(v) ? v.join(', ') : String(v);
  return String(v);
}

/** Convert an editor's draft string back into the typed value to persist. */
export function coerce(type: CellType, draft: string): any {
  const t = (draft ?? '').trim();
  if (type === 'number') return t === '' ? 0 : Number(t) || 0;
  if (type === 'currency') return t === '' ? 0 : Number(t.replace(/[^0-9.\-]/g, '')) || 0;
  if (type === 'date') return t ? new Date(t).toISOString() : null;
  if (type === 'tags') return t ? t.split(',').map((x) => x.trim()).filter(Boolean) : [];
  return t === '' ? null : t;
}

/** Render a value as plain text for CSV export. */
export function csvValue(type: CellType, v: any, options?: SelectOption[]): string {
  if (type === 'tags') return Array.isArray(v) ? v.join('; ') : '';
  if (type === 'select') return options?.find((o) => o.value === v)?.label ?? (v ?? '');
  if (type === 'date') return v ? String(v).split('T')[0] : '';
  if (type === 'check') return v ? 'Yes' : 'No';
  return v == null ? '' : String(v);
}
