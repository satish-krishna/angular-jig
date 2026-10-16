import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Hero, HeroStatus } from '../domain/hero';

/** Badge colour for each status. Shared by every screen that shows a hero's status. */
export const STATUS_VARIANT: Record<HeroStatus, BadgeVariants['variant']> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Up to two initials: the first letters of the first two words, or the first two letters. */
export function heroInitials(name: string): string {
  const words = name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}

/** One hero as a table row: the hero plus the presentation values a row needs. */
export interface HeroRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: BadgeVariants['variant'];
}

export function heroRow(hero: Hero): HeroRow {
  return { hero, initials: heroInitials(hero.name), statusVariant: STATUS_VARIANT[hero.status] };
}
