import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { HeroStatus } from '../domain/hero.model';

export type StatusVariant = NonNullable<BadgeVariants['variant']>;

// Status carries meaning, so each state maps to a semantic badge variant rather than the accent.
export const STATUS_VARIANT: Record<HeroStatus, StatusVariant> = {
  Active: 'success',
  Reserve: 'outline',
  Injured: 'warning',
  MIA: 'destructive',
};

// Up to two initials from the name's words, ignoring punctuation: "Dr. Ion" -> "DI".
export function initialsOf(name: string): string {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}
