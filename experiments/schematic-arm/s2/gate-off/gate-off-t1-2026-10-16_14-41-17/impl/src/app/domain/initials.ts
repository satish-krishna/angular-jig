/** Two-letter portrait fallback from a name, for example "SW" or "DI". Empty for an empty name. */
export function initialsOf(name: string): string {
  return name
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
