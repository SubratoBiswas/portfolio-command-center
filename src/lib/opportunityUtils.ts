// =============================================================================
// Pure, framework-free helpers for the Opportunities page.
// Extracted so they can be unit-tested in isolation (see opportunityUtils.test.ts).
// =============================================================================

export type OppLike = Record<string, any>;

export const CLOSED_STAGES = ['not_interested', 'not_legit', 'deal_closed'];

/** True if the opportunity has a follow-up date that is today or in the past and it is not closed. */
export function isFollowUpDue(o: OppLike, now: Date = new Date()): boolean {
  if (!o || !o.followUpDate) return false;
  if (CLOSED_STAGES.includes(o.aiStage)) return false;
  const d = new Date(o.followUpDate);
  if (isNaN(d.getTime())) return false;
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return d.getTime() <= end.getTime();
}

/** Build a prefilled mailto: link for a follow-up email to the contact. */
export function buildFollowUpMailto(o: OppLike, stageLabel?: string): string {
  const to = (o.contactEmail || '').trim();
  const stage = stageLabel ?? o.aiStage ?? '';
  const subject = `Follow-up: ${o.name} — Trinamix AI`;
  const body = [
    `Hi ${o.contactName || 'there'},`, '',
    `Following up on ${o.name}.`,
    stage ? `Current status: ${stage}.` : '',
    o.nextSteps ? `Next step: ${o.nextSteps}` : '',
    '', 'Best regards,', o.trinamixOwner || o.emailOwner || 'Trinamix Team',
  ].filter(Boolean).join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type SortKey = 'rating' | 'name' | 'followup';

/** Sort opportunities for the inquiries list. Returns a new array. */
export function sortOpportunities<T extends OppLike>(list: T[], sortKey: SortKey, now?: Date): T[] {
  const cmp = (a: T, b: T) => {
    if (sortKey === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
    if (sortKey === 'followup') {
      const ad = isFollowUpDue(a, now) ? 0 : 1;
      const bd = isFollowUpDue(b, now) ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return String(a.followUpDate ?? '9999').localeCompare(String(b.followUpDate ?? '9999'));
    }
    return (b.dealRating ?? 0) - (a.dealRating ?? 0); // rating high -> low
  };
  return [...list].sort(cmp);
}

/** Set of normalized company names that appear more than once. */
export function findDuplicateNames(list: OppLike[]): Set<string> {
  const counts: Record<string, number> = {};
  list.forEach((o) => {
    const k = (o.name || '').trim().toLowerCase();
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  return new Set(Object.keys(counts).filter((k) => counts[k] > 1));
}

/** Planning view ordering: active first by planned start date, parked rows sink to the bottom. */
export function sortPlanningRows<T extends OppLike>(list: T[]): T[] {
  const active = list.filter((o) => !['not_interested', 'not_legit'].includes(o.aiStage));
  return [...active].sort((a, b) => {
    const ap = a.parked ? 1 : 0, bp = b.parked ? 1 : 0;
    if (ap !== bp) return ap - bp;
    const ad = a.plannedStartDate || '', bd = b.plannedStartDate || '';
    if (ad && bd) return ad.localeCompare(bd);
    if (ad) return -1;
    if (bd) return 1;
    return (b.dealRating || 0) - (a.dealRating || 0);
  });
}

/** Total planned headcount for non-parked rows. */
export function sumPlannedResources(rows: OppLike[]): number {
  return rows.filter((o) => !o.parked).reduce((s, o) => s + (Number(o.plannedResources) || 0), 0);
}

/** Prepend a timestamped update to the history log without mutating the input. Empty text => unchanged. */
export function appendHistory(history: any[] | undefined, text: string, author?: string, now: Date = new Date()) {
  const prev = Array.isArray(history) ? history : [];
  const t = (text || '').trim();
  if (!t) return prev;
  return [{ date: now.toISOString(), text: t, author: author || 'You' }, ...prev];
}

/** Build CSV text for the planning grid. stageLabel maps a stage key to a display label. */
export function toPlanningCsv(rows: OppLike[], stageLabel: (k: string) => string = (k) => k): string {
  const headers = ['Company', 'Stage', 'Rating', 'Planned Start', 'Planned End', 'Resources', 'Team', 'Owner', 'Status'];
  const body = rows.map((o) => [
    o.name, stageLabel(o.aiStage), o.dealRating ?? 0,
    o.plannedStartDate ? o.plannedStartDate.split('T')[0] : '',
    o.plannedEndDate ? o.plannedEndDate.split('T')[0] : '',
    o.plannedResources ?? 0, o.teamAssignment ?? '', o.trinamixOwner ?? '', o.parked ? 'Parked' : 'Active',
  ]);
  const esc = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [headers, ...body].map((r) => r.map(esc).join(',')).join('\n');
}
