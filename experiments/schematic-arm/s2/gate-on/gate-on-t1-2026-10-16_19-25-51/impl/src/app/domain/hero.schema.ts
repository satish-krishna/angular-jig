import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';

/**
 * The hero edit form's schema: the single source of truth for its shape, rules,
 * and field labels. Validate through validateStandardSchema; do not restate
 * these rules as per-field validators.
 */
export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Hero name', control: 'text', order: 1 }),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text', order: 2 }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  }),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    order: 4,
    help: 'Whole number from 0 to 100.',
  }),
});

export type HeroModel = z.infer<typeof heroSchema>;
