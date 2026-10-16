import { z } from 'zod';
import { HERO_STATUSES, POWER_CLASSES } from './hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';

// The hero dossier fields. This schema is the single source of truth for the
// shape, the rules, and the field labels. The edit and recruit forms read labels
// off `.meta()`. Status is a select, not a switch: a boolean cannot carry Injured,
// Reserve, or MIA.
export const heroDossierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(40, 'Name must be 40 characters or fewer')
    .meta({ label: 'Hero name', control: 'text', order: 1 } satisfies FormFieldMeta),
  alias: z
    .string()
    .trim()
    .min(1, 'Alias is required')
    .max(40, 'Alias must be 40 characters or fewer')
    .meta({ label: 'Alias', control: 'text', order: 2 } satisfies FormFieldMeta),
  powerClass: z
    .enum(POWER_CLASSES)
    .meta({
      label: 'Power class',
      control: 'select',
      order: 3,
      options: POWER_CLASSES.map((value) => ({ value, label: value })),
    } satisfies FormFieldMeta),
  powerIndex: z
    .number()
    .int('Power index must be a whole number')
    .min(0, 'Power index runs from 0 to 100')
    .max(100, 'Power index runs from 0 to 100')
    .meta({ label: 'Power index', control: 'number', order: 4, help: 'Scale 0 to 100' } satisfies FormFieldMeta),
  status: z
    .enum(HERO_STATUSES)
    .meta({
      label: 'Status',
      control: 'select',
      order: 5,
      options: HERO_STATUSES.map((value) => ({ value, label: value })),
    } satisfies FormFieldMeta),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or fewer')
    .meta({ label: 'Notes', control: 'textarea', order: 6 } satisfies FormFieldMeta),
});

export type HeroDossierModel = z.infer<typeof heroDossierSchema>;

/** The recruit form: the identity and power fields. A recruit's status and clearance are set by the roster, not the form. */
export const recruitSchema = heroDossierSchema.pick({ name: true, alias: true, powerClass: true, powerIndex: true, notes: true });
export type RecruitModel = z.infer<typeof recruitSchema>;
