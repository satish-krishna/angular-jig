import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { POWER_CLASSES } from './hero';

/**
 * The hero form schema. It is the single source of truth for the shape, rules, and field
 * labels of a hero's editable fields. Labels ride on each field via `.meta()`, read back with
 * `formMeta()`. Validation runs through `validateStandardSchema`. The recruit form extends it.
 */
const powerClassOptions = POWER_CLASSES.map((value) => ({ value, label: value }));

export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Name', control: 'text' } satisfies FormFieldMeta),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text' } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({ label: 'Power class', control: 'select', options: powerClassOptions } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({ label: 'Power index', control: 'number' } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
