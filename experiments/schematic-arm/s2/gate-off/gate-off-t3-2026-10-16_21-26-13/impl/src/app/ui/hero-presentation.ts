import type { Hero, HeroStatus } from '../domain/hero.model';

export type StatusVariant = 'success' | 'warning' | 'secondary' | 'destructive';

const STATUS_VARIANT = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
} as const satisfies Record<HeroStatus, StatusVariant>;

/** The badge variant that carries a hero's status. Shared by the hero card and the roster table. */
export function heroStatusVariant(status: HeroStatus): StatusVariant {
  return STATUS_VARIANT[status];
}

/** Up to two letters for an avatar fallback, taken from the hero's name. */
export function heroInitials(name: string): string {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
}

/** A hero prepared for a roster row: the record plus the presentation it needs. */
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: StatusVariant;
}

export function toRosterRow(hero: Hero): RosterRow {
  return { hero, initials: heroInitials(hero.name), statusVariant: heroStatusVariant(hero.status) };
}
