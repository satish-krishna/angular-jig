import type { HeroStatus } from '../domain/hero.model';

/** The badge variants a roster status can take. Matches the variants `hlmBadge` ships. */
export type StatusBadge = 'success' | 'warning' | 'secondary' | 'destructive';

/** Badge variant per roster status. Shared by the dashboard card and the roster table. */
export const HERO_STATUS_BADGE: Record<HeroStatus, StatusBadge> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Up to two initials from a hero name, e.g. "Dr. Ion" -> "DI", "Silverwing" -> "SI". */
export function initialsOf(name: string): string {
  const words = name.replace(/[^A-Za-z\s]/g, '').split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words.slice(0, 2).map((word) => word[0]) : [words[0]?.slice(0, 2) ?? ''];
  return letters.join('').toUpperCase();
}
