import type { Hero, HeroStatus, PowerClass } from './hero.model';

/** The semantic badge variants a status or a result can take. Each one carries meaning, so each is a token. */
export type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary';

/** Status carries meaning, so each one maps to a semantic badge variant. */
export const STATUS_VARIANT: Readonly<Record<HeroStatus, StatusVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Up to two initials from a name, for an avatar fallback. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

/** One roster line, already shaped for a table: no formatting left to the template. */
export interface RosterRow {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly initials: string;
  readonly powerClass: PowerClass;
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly statusVariant: StatusVariant;
  readonly clearanceTier: number;
}

/** Shape a hero for a table. Every screen that lists heroes builds its rows here. */
export function toRosterRow(hero: Hero): RosterRow {
  return {
    id: hero.id,
    name: hero.name,
    alias: hero.alias,
    initials: initialsOf(hero.name),
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    status: hero.status,
    statusVariant: STATUS_VARIANT[hero.status],
    clearanceTier: hero.clearanceTier,
  };
}
