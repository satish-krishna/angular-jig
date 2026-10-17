import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Hero, HeroStatus } from '../domain/hero';
import type { MissionStatus } from '../domain/mission';

const STATUS_VARIANT: Readonly<Record<HeroStatus, BadgeVariants['variant']>> = {
  Active: 'default',
  Injured: 'destructive',
  Reserve: 'secondary',
  MIA: 'outline',
};

const MISSION_VARIANT: Readonly<Record<MissionStatus, BadgeVariants['variant']>> = {
  Live: 'default',
  Succeeded: 'secondary',
  Failed: 'destructive',
};

// The badge variant that carries a hero's status on every screen that shows one.
export function statusVariantOf(status: HeroStatus): BadgeVariants['variant'] {
  return STATUS_VARIANT[status];
}

// The badge variant that carries a mission's outcome.
export function missionVariantOf(status: MissionStatus): BadgeVariants['variant'] {
  return MISSION_VARIANT[status];
}

// Two-letter portrait initials from the first two alphabetic words: "Dr. Ion" gives "DI".
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

// One roster row: the hero plus the presentation the table needs, so the template reads no logic.
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: BadgeVariants['variant'];
  readonly link: readonly string[];
}

export function rosterRowOf(hero: Hero): RosterRow {
  return {
    hero,
    initials: initialsOf(hero.name),
    statusVariant: statusVariantOf(hero.status),
    link: ['/detail', hero.id],
  };
}
