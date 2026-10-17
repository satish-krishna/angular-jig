// Two-letter portrait initials from the codename: "Dr. Ion" -> "DI", "Silverwing" -> "SI".
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).map((word) => word.replace(/[^A-Za-z]/g, '')).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] ?? '').slice(0, 2).toUpperCase();
}
