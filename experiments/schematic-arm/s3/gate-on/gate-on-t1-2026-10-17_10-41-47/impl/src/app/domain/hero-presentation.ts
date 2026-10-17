import type { HeroStatus } from './hero.model';

/** The badge variants a hero status can take. Kept to the primitive's own variant names. */
export type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary';

/** Status to badge variant. Active is success, Injured is warning, MIA is destructive, Reserve is neutral. */
export const STATUS_VARIANT: Readonly<Record<HeroStatus, StatusVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Two-letter portrait initials from the first two words with letters, e.g. "Dr. Ion" gives "DI". */
export function heroInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
