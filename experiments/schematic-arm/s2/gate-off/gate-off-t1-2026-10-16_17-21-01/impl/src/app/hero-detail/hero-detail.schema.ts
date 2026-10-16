import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';

// The edit form's single source of truth: shape, rules, and field labels. Labels
// and control kinds ride on each field via .meta() (read them with formMeta).
export const heroEditSchema = z.object({
  name: z.string().min(1).meta({ label: 'Name', control: 'text', order: 1 } satisfies FormFieldMeta),
  alias: z.string().min(1).meta({ label: 'Alias', control: 'text', order: 2 } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    order: 4,
    help: 'Scaled 0 to 100.',
  } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
