import { z } from 'zod';
import { heroFields } from '../forms/hero-fields.schema';
import type { FormFieldMeta } from '../forms/form-field-meta';

/**
 * The hero edit form. This schema is the single source of truth for the form's shape,
 * its rules, and its field labels. Labels ride on each field via `.meta()`.
 */
export const heroEditSchema = z.object({
  ...heroFields,
  active: z.boolean().meta({ label: 'Active', control: 'checkbox' } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
