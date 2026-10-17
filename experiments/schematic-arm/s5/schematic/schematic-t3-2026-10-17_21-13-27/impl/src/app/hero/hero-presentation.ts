import type { BadgeVariants } from '@spartan-ng/helm/badge';

export type BadgeVariant = NonNullable<BadgeVariants['variant']>;

/**
 * How a hero's power class and status look, in one place. The roster, the dashboard
 * card and the detail screen all read these, so the same hero is the same colour on
 * every screen. Unlisted values fall back to outline rather than throwing.
 */
const POWER_CLASS_VARIANT: Readonly<Record<string, BadgeVariant>> = {
  Aerial: 'default',
  Energy: 'secondary',
  Psionic: 'destructive',
  Tech: 'secondary',
  Mutant: 'default',
  Cosmic: 'outline',
  Enhanced: 'default',
};

const STATUS_VARIANT: Readonly<Record<string, BadgeVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

export const heroPowerClassVariant = (value: string): BadgeVariant =>
  POWER_CLASS_VARIANT[value] ?? 'outline';

export const heroStatusVariant = (value: string): BadgeVariant => STATUS_VARIANT[value] ?? 'outline';

/** Two-letter monogram for an avatar, e.g. "Silverwing" -> "S", "Dr. Ion" -> "DI". */
export const monogramOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
