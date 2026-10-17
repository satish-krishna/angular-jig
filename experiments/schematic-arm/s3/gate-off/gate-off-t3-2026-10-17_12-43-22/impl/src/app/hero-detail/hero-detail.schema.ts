import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';

// Single source of truth for the hero edit form: shape, rules, and field labels.
export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Name', control: 'text', order: 1 }),
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
    help: 'Between 0 and 100.',
  }),
  notes: z.string().trim().max(500).meta({ label: 'Notes', control: 'textarea', order: 5 }),
  active: z.boolean().meta({
    label: 'Active',
    control: 'checkbox',
    order: 6,
    help: 'Turning this off moves an active hero to reserve.',
  }),
});

export type HeroModel = z.infer<typeof heroSchema>;
