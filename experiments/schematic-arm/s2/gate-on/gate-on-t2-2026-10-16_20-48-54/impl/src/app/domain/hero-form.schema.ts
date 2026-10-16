import { z } from 'zod';
import { POWER_CLASSES } from './hero';
import type { FormFieldMeta } from '../forms/form-field-meta';

/** The clearance tiers a form offers, as select options. */
const CLEARANCE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({ value, label: `Tier ${value}` }));

/**
 * The hero form's schema. It is the single source of truth for shape, rules, and
 * field labels: the edit and recruit forms validate with validateStandardSchema and
 * read labels from .meta(). Recruit drops the Active switch: a new hero starts Active.
 */
export const heroSchema = z.object({
  name: z.string().min(1, 'Name is required').max(40).meta({
    label: 'Name',
    control: 'text',
  } satisfies FormFieldMeta),
  alias: z.string().min(1, 'Alias is required').max(60).meta({
    label: 'Alias',
    control: 'text',
    help: 'Use "Unknown" or "Classified" if the identity is not on record.',
  } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    help: 'Whole number from 0 to 100.',
  } satisfies FormFieldMeta),
  clearance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).meta({
    label: 'Clearance',
    control: 'select',
    options: CLEARANCE_OPTIONS,
  } satisfies FormFieldMeta),
  notes: z.string().max(500).meta({
    label: 'Notes',
    control: 'textarea',
  } satisfies FormFieldMeta),
  active: z.boolean().meta({
    label: 'Active',
    control: 'switch',
    help: 'Turning this off moves an Active hero to Reserve.',
  } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;

/** The recruit form: the hero form without the Active switch. */
export const recruitSchema = heroSchema.omit({ active: true });

export type RecruitModel = z.infer<typeof recruitSchema>;
