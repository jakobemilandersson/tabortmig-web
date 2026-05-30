/**
 * Adds `months` calendar months to `optOutDate`.
 * Clamps to the last day of the target month if the original day overflows
 * (e.g. Jan 31 + 1 month → Feb 28/29, not Mar 2/3).
 */
export function computeExpiryDate(optOutDate: Date, months: number): Date {
  const result = new Date(optOutDate);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);

  // setMonth can overflow into the next month when the source day doesn't
  // exist in the target month (e.g. Jan 31 → Mar 2 in a non-leap year).
  // Detect this by checking if the resulting month is past the intended one.
  const expectedMonth = ((targetMonth % 12) + 12) % 12;
  if (result.getMonth() !== expectedMonth) {
    // Roll back to the last day of the intended month.
    result.setDate(0);
  }

  return result;
}
