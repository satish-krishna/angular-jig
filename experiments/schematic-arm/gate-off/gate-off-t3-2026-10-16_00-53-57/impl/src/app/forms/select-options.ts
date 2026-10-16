/** Turns a list of values into select options, with each value doubling as its label. */
export function selectOptions<const T extends readonly string[]>(values: T): ReadonlyArray<{ value: T[number]; label: string }> {
  return values.map((value) => ({ value, label: value }));
}
