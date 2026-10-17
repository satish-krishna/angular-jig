import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { CLEARANCE_TIERS, HERO_STATUSES, POWER_CLASSES } from './hero.model';

// Schema for the hero edit form. Shape, rules, and field labels all live here;
// the form reads labels back with formMeta() and validates with validateStandardSchema.
// Mission count and success rate are derived from the mission log, not edited, so they are absent.

const options = <const T extends string>(values: readonly T[]) =>
  values.map((value) => ({ value, label: value }));

export const heroSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .meta({ label: 'Name', control: 'text', placeholder: 'Full name' } satisfies FormFieldMeta),
  alias: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .meta({ label: 'Alias', control: 'text', placeholder: 'Codename' } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: options(POWER_CLASSES),
  } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    help: 'Whole number from 0 to 100',
  } satisfies FormFieldMeta),
  status: z.enum(HERO_STATUSES).meta({
    label: 'Status',
    control: 'select',
    options: options(HERO_STATUSES),
  } satisfies FormFieldMeta),
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance tier',
    control: 'select',
    options: options(CLEARANCE_TIERS),
  } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;

// Recruiting takes only the identity and intake fields. Status starts at Reserve and the record has no missions yet.
export const recruitSchema = heroSchema.pick({
  name: true,
  alias: true,
  powerClass: true,
  powerIndex: true,
  clearance: true,
});

export type RecruitModel = z.infer<typeof recruitSchema>;
