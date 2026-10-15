import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { POWER_CLASSES } from '../domain/hero.model';

/**
 * The hero edit form's single source of truth: shape, rules, and field labels. The
 * form component reads labels from `.meta()` rather than restating them.
 */
export const heroDetailSchema = z.object({
  name: z.string().trim().min(1, 'Enter a codename.').max(40).meta({
    label: 'Codename',
    control: 'text',
    placeholder: 'Public-facing hero name',
    order: 1,
  } satisfies FormFieldMeta),
  alias: z.string().trim().min(1, 'Enter a civilian alias.').max(60).meta({
    label: 'Civilian alias',
    control: 'text',
    placeholder: 'Unknown or Classified if restricted',
    order: 2,
  } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
    order: 3,
  } satisfies FormFieldMeta),
  power: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    help: 'Whole number from 0 to 100.',
    order: 4,
  } satisfies FormFieldMeta),
  dossier: z.string().trim().max(500).meta({
    label: 'Dossier',
    control: 'textarea',
    help: 'Up to 500 characters.',
    order: 5,
  } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroDetailSchema>;
