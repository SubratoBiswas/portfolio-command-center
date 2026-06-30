import { describe, it, expect } from 'vitest';
import { toDraft, coerce, csvValue } from './sheetUtils';

describe('toDraft', () => {
  it('strips time from dates', () => {
    expect(toDraft('date', '2026-07-01T00:00:00.000Z')).toBe('2026-07-01');
  });
  it('joins tags with commas', () => {
    expect(toDraft('tags', ['MDM', 'SNO'])).toBe('MDM, SNO');
  });
  it('returns empty string for null', () => {
    expect(toDraft('text', null)).toBe('');
  });
});

describe('coerce', () => {
  it('numbers and currency', () => {
    expect(coerce('number', '3')).toBe(3);
    expect(coerce('number', '')).toBe(0);
    expect(coerce('currency', '$1,250')).toBe(1250);
  });
  it('dates to ISO or null', () => {
    expect(coerce('date', '2026-07-01')).toContain('2026-07-01');
    expect(coerce('date', '')).toBeNull();
  });
  it('tags split and trim', () => {
    expect(coerce('tags', 'MDM, SNO ,  ')).toEqual(['MDM', 'SNO']);
    expect(coerce('tags', '')).toEqual([]);
  });
  it('text empty becomes null', () => {
    expect(coerce('text', '   ')).toBeNull();
    expect(coerce('text', 'Acme')).toBe('Acme');
  });
});

describe('csvValue', () => {
  it('maps select to label, tags to semicolons, checks to Yes/No', () => {
    expect(csvValue('select', 'reply_sent', [{ value: 'reply_sent', label: 'Reply Sent' }])).toBe('Reply Sent');
    expect(csvValue('tags', ['a', 'b'])).toBe('a; b');
    expect(csvValue('check', true)).toBe('Yes');
    expect(csvValue('check', false)).toBe('No');
    expect(csvValue('date', '2026-07-01T00:00:00Z')).toBe('2026-07-01');
  });
});
