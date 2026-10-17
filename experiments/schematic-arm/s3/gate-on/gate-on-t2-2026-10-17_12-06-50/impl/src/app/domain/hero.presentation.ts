import type { HeroStatus } from './hero.model';

export type HeroStatusVariant = 'default' | 'secondary' | 'outline' | 'destructive';

// Status is carried by the badge variant: each state has one fixed look, decided here.
export const STATUS_VARIANT: Readonly<Record<HeroStatus, HeroStatusVariant>> = {
  Active: 'default',
  Injured: 'secondary',
  Reserve: 'outline',
  MIA: 'destructive',
};

// Two letters from the first two words of the name: "Dr. Ion" reads as "DI".
export function heroInitials(name: string): string {
  return name
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}
