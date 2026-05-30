// Note: date strings like '2024-01-15' are parsed as UTC midnight by the Date
// constructor, but computeExpiryDate operates in local time via setMonth/setDate.
// All assertions use matching UTC-midnight Dates so results are consistent
// across timezones for these whole-day values.
import { describe, expect, it } from 'vitest';
import { computeExpiryDate } from './computeExpiryDate';

describe('computeExpiryDate', () => {
  it('normal case: 2024-01-15 + 12 months = 2025-01-15', () => {
    const result = computeExpiryDate(new Date('2024-01-15'), 12);
    expect(result).toEqual(new Date('2025-01-15'));
  });

  it('month-end edge case: 2024-01-31 + 1 month clamps to 2024-02-29 (leap year)', () => {
    const result = computeExpiryDate(new Date('2024-01-31'), 1);
    expect(result).toEqual(new Date('2024-02-29'));
  });

  it('month-end edge case: 2023-01-31 + 1 month clamps to 2023-02-28 (non-leap year)', () => {
    const result = computeExpiryDate(new Date('2023-01-31'), 1);
    expect(result).toEqual(new Date('2023-02-28'));
  });

  it('MrKoll 6-month case: 2024-03-15 + 6 months = 2024-09-15', () => {
    const result = computeExpiryDate(new Date('2024-03-15'), 6);
    expect(result).toEqual(new Date('2024-09-15'));
  });
});
