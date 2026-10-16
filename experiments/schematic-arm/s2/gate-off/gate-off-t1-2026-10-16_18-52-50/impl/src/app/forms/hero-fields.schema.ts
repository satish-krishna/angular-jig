import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';
import type { FormFieldMeta } from './form-field-meta';

/**
 * The hero fields every hero form shares. Each schema that edits a hero spreads these in,
 * so a label, a rule or an option list is written once, here.
 */
export const heroFields = {
  name: z.string().trim().min(1).meta({ label: 'Name', control: 'text' } satisfies FormFieldMeta),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text' } satisfies FormFieldMeta),
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
  notes: z.string().trim().meta({ label: 'Notes', control: 'textarea' } satisfies FormFieldMeta),
};
