/** Two-letter avatar fallback taken from a hero's name: "Dr. Ion" becomes "DR". */
export function initialsOf(name: string): string {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
}
