/** Compares calendar days — the unit a date picker selects, whatever the time of day. */
export function sameDay(a: Date | undefined | null, b: Date | undefined | null): boolean {
  if (!a || !b) return a == b;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
