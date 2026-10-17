// The next ID in a prefix-and-number series: HRO-0082 after HRO-0081.
export function nextId(prefix: string, existing: readonly string[]): string {
  const highest = existing.reduce((max, id) => Math.max(max, Number(id.split('-')[1]) || 0), 0);
  return `${prefix}-${String(highest + 1).padStart(4, '0')}`;
}
