import { describe, it, expect } from 'vitest';
import {
  isFollowUpDue, buildFollowUpMailto, sortOpportunities, findDuplicateNames,
  sortPlanningRows, sumPlannedResources, appendHistory, toPlanningCsv,
} from './opportunityUtils';

const NOW = new Date('2026-06-30T12:00:00Z');

describe('isFollowUpDue', () => {
  it('is true when follow-up date is today', () => {
    expect(isFollowUpDue({ followUpDate: '2026-06-30', aiStage: 'reply_sent' }, NOW)).toBe(true);
  });
  it('is true when overdue', () => {
    expect(isFollowUpDue({ followUpDate: '2026-06-01', aiStage: 'reply_sent' }, NOW)).toBe(true);
  });
  it('is false when in the future', () => {
    expect(isFollowUpDue({ followUpDate: '2026-07-15', aiStage: 'reply_sent' }, NOW)).toBe(false);
  });
  it('is false when the opportunity is closed', () => {
    expect(isFollowUpDue({ followUpDate: '2026-06-01', aiStage: 'deal_closed' }, NOW)).toBe(false);
    expect(isFollowUpDue({ followUpDate: '2026-06-01', aiStage: 'not_interested' }, NOW)).toBe(false);
  });
  it('is false with no/invalid date', () => {
    expect(isFollowUpDue({ aiStage: 'reply_sent' }, NOW)).toBe(false);
    expect(isFollowUpDue({ followUpDate: 'not-a-date', aiStage: 'reply_sent' }, NOW)).toBe(false);
    expect(isFollowUpDue(null as any, NOW)).toBe(false);
  });
});

describe('buildFollowUpMailto', () => {
  const o = { name: 'Sonoco', contactName: 'Jane', contactEmail: 'jane@sonoco.com', nextSteps: 'Send SOW', trinamixOwner: 'Viral' };
  it('targets the contact email', () => {
    expect(buildFollowUpMailto(o, 'Reply Sent')).toMatch(/^mailto:jane@sonoco\.com\?/);
  });
  it('URL-encodes subject and body and includes context', () => {
    const url = buildFollowUpMailto(o, 'Reply Sent');
    const body = decodeURIComponent(url.split('body=')[1]);
    expect(decodeURIComponent(url)).toContain('Follow-up: Sonoco');
    expect(body).toContain('Following up on Sonoco.');
    expect(body).toContain('Current status: Reply Sent.');
    expect(body).toContain('Next step: Send SOW');
    expect(body).toContain('Viral');
    expect(url).not.toContain(' '); // properly encoded
  });
  it('falls back gracefully with missing fields', () => {
    const url = buildFollowUpMailto({ name: 'Acme' });
    expect(url).toMatch(/^mailto:\?/);
    expect(decodeURIComponent(url)).toContain('Hi there,');
    expect(decodeURIComponent(url)).toContain('Trinamix Team');
  });
});

describe('sortOpportunities', () => {
  const list = [
    { name: 'Bravo', dealRating: 2, followUpDate: '2026-06-01', aiStage: 'reply_sent' },
    { name: 'Alpha', dealRating: 5, aiStage: 'reply_sent' },
    { name: 'Charlie', dealRating: 4, followUpDate: '2026-07-20', aiStage: 'reply_sent' },
  ];
  it('rating: high to low', () => {
    expect(sortOpportunities(list, 'rating').map((o) => o.dealRating)).toEqual([5, 4, 2]);
  });
  it('name: A to Z', () => {
    expect(sortOpportunities(list, 'name').map((o) => o.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });
  it('followup: due first', () => {
    expect(sortOpportunities(list, 'followup', NOW)[0].name).toBe('Bravo');
  });
  it('does not mutate the input', () => {
    const copy = [...list];
    sortOpportunities(list, 'rating');
    expect(list).toEqual(copy);
  });
});

describe('findDuplicateNames', () => {
  it('flags case/space-insensitive duplicates and ignores blanks', () => {
    const dups = findDuplicateNames([
      { name: 'Bayer' }, { name: 'bayer ' }, { name: 'Cisco' }, { name: '' }, { name: '  ' },
    ]);
    expect(dups.has('bayer')).toBe(true);
    expect(dups.has('cisco')).toBe(false);
    expect(dups.size).toBe(1);
  });
});

describe('sortPlanningRows', () => {
  const list = [
    { name: 'Parked1', parked: true, plannedStartDate: '2026-01-01', aiStage: 'reply_sent', dealRating: 5 },
    { name: 'Late', plannedStartDate: '2026-09-01', aiStage: 'reply_sent', dealRating: 1 },
    { name: 'Early', plannedStartDate: '2026-07-01', aiStage: 'reply_sent', dealRating: 1 },
    { name: 'Lost', aiStage: 'not_interested' },
  ];
  it('excludes lost, sorts active by start date, parks sink to bottom', () => {
    const rows = sortPlanningRows(list);
    expect(rows.map((r) => r.name)).toEqual(['Early', 'Late', 'Parked1']);
  });
});

describe('sumPlannedResources', () => {
  it('sums non-parked headcount, coercing strings', () => {
    expect(sumPlannedResources([
      { plannedResources: 3 }, { plannedResources: '2' }, { plannedResources: 5, parked: true },
    ])).toBe(5);
  });
});

describe('appendHistory', () => {
  it('prepends a timestamped entry', () => {
    const out = appendHistory([{ date: 'x', text: 'old' }], 'new note', 'Subrato', NOW);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ date: NOW.toISOString(), text: 'new note', author: 'Subrato' });
    expect(out[1].text).toBe('old');
  });
  it('is a no-op for empty text and never mutates input', () => {
    const prev = [{ date: 'x', text: 'old' }];
    expect(appendHistory(prev, '   ', 'X', NOW)).toBe(prev);
    expect(appendHistory(undefined, '', 'X', NOW)).toEqual([]);
  });
});

describe('toPlanningCsv', () => {
  it('emits a header, maps stage labels, escapes quotes, and marks parked rows', () => {
    const csv = toPlanningCsv(
      [{ name: 'Ac"me', aiStage: 'reply_sent', dealRating: 4, plannedResources: 2, parked: true }],
      (k) => (k === 'reply_sent' ? 'Reply Sent' : k),
    );
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Company');
    expect(lines[1]).toContain('"Reply Sent"');
    expect(lines[1]).toContain('"Ac""me"'); // doubled quote escaping
    expect(lines[1]).toContain('"Parked"');
  });
});
