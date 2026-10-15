import type { Hero, HeroStatus } from '../domain/hero.model';

export type HeroStatusVariant = 'default' | 'secondary' | 'outline' | 'destructive';

/** Badge variant per hero status. Shared by every screen that shows a status pill. */
export const HERO_STATUS_VARIANT: Readonly<Record<HeroStatus, HeroStatusVariant>> = {
  Active: 'default',
  Reserve: 'secondary',
  Injured: 'outline',
  MIA: 'destructive',
};

/** Two-letter portrait fallback from the public name, e.g. `Dr. Ion` -> `DI`. */
export function heroInitials(name: string): string {
  return name
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** One roster line with its presentation already derived, so the template reads it straight off. */
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: HeroStatusVariant;
}

/** Roster lines, highest power first. Sorts a copy so the caller's list is never reordered. */
export function toRosterRows(heroes: readonly Hero[]): readonly RosterRow[] {
  return [...heroes]
    .sort((a, b) => b.power - a.power)
    .map((hero) => ({
      hero,
      initials: heroInitials(hero.name),
      statusVariant: HERO_STATUS_VARIANT[hero.status],
    }));
}
