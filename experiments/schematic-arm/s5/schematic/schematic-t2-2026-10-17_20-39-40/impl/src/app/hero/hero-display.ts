import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { formMeta } from '../forms/zod-meta';
import type { Hero, HeroStatus } from './hero.model';
import { heroSchema } from './hero.schema';

export type HeroBadgeVariant = NonNullable<BadgeVariants['variant']>;

/** One status-to-tone mapping for every screen that shows a status, so Active reads the same everywhere. */
export const HERO_STATUS_VARIANT: Readonly<Record<HeroStatus, HeroBadgeVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Badge tone for a status string from an untyped source; anything unrecognised reads as neutral. */
export const heroStatusVariantOf = (value: string): HeroBadgeVariant =>
  Object.hasOwn(HERO_STATUS_VARIANT, value) ? HERO_STATUS_VARIANT[value as HeroStatus] : 'secondary';

/** Power class choices, read off the schema so the filter and the form never drift apart. */
export const POWER_CLASS_OPTIONS: NonNullable<FormFieldMeta['options']> =
  formMeta(heroSchema)['powerClass'].options ?? [];

/** Up to two initials from a hero name, for avatar fallbacks. */
export const heroInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/** Deployable only when cleared for duty: Active status and on the active roster. */
export const isDeployable = (hero: Hero): boolean => hero.status === 'Active' && hero.active;
