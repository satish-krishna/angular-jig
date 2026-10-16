import { z } from 'zod';
import { POWER_CLASSES } from './hero.model';

/**
 * The hero form's schema: the fields the edit and recruit forms share. It is the single
 * source of truth for the shape, the rules, and the field labels. Validation runs through
 * `validateStandardSchema`. Recruit extends it with a clearance; edit uses it as is.
 */
export const heroSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Name is required' })
    .max(60, { error: 'Name must be 60 characters or fewer' })
    .meta({ label: 'Hero name', control: 'text', placeholder: 'e.g. Silverwing' }),
  alias: z
    .string()
    .trim()
    .min(1, { error: 'Alias is required' })
    .max(60, { error: 'Alias must be 60 characters or fewer' })
    .meta({ label: 'Alias', control: 'text' }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  }),
  powerIndex: z
    .number({ error: 'Power index must be a number' })
    .int({ error: 'Power index must be a whole number' })
    .min(0, { error: 'Power index must be between 0 and 100' })
    .max(100, { error: 'Power index must be between 0 and 100' })
    .meta({ label: 'Power index', control: 'number' }),
});

export type HeroModel = z.infer<typeof heroSchema>;
