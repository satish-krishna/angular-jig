import { z } from 'zod';
import { heroFieldSchemas } from '../domain/hero-fields.schema';

/**
 * The hero edit form. This schema is the single source of truth for the form's
 * shape, rules, and field labels; the form reads its labels off `.meta()`.
 */
export const heroEditSchema = z.object({
  ...heroFieldSchemas,
  active: z.boolean().meta({ label: 'Active', control: 'checkbox' }),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
