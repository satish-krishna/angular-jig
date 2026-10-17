import { z } from 'zod';
import { POWER_CLASSES } from './hero';
import type { FormFieldMeta } from '../forms/form-field-meta';

// The single source of truth for the hero form, shared by the edit screen and recruiting: shape, rules, and field labels.
// Labels and control kinds ride on .meta() and are read back with formMeta().
export const heroFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .meta({ label: 'Name', control: 'text', placeholder: 'Hero name', order: 1 } satisfies FormFieldMeta),
  alias: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .meta({ label: 'Alias', control: 'text', placeholder: 'Civilian name or codename', order: 2 } satisfies FormFieldMeta),
  powerClass: z
    .enum(POWER_CLASSES)
    .meta({
      label: 'Power class',
      control: 'select',
      options: POWER_CLASSES.map((value) => ({ value, label: value })),
      order: 3,
    } satisfies FormFieldMeta),
  powerIndex: z
    .number()
    .int()
    .min(0)
    .max(100)
    .meta({ label: 'Power index', control: 'number', help: 'Between 0 and 100.', order: 4 } satisfies FormFieldMeta),
  notes: z
    .string()
    .max(500)
    .meta({ label: 'Notes', control: 'textarea', placeholder: 'Field notes', order: 5 } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroFormSchema>;
