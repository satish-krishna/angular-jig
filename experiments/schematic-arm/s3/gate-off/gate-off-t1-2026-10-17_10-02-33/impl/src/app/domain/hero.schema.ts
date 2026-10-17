import { z } from 'zod';
import { CLEARANCE_TIERS, POWER_CLASSES } from './hero.model';

// The hero form's shape, rules, and field labels. Shared by the edit form on the detail screen and the
// recruit form. Labels ride on the schema via .meta().
export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Name', control: 'text', order: 1 }),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text', order: 2 }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  }),
  powerIndex: z.number().int().min(0).max(100).meta({ label: 'Power index', control: 'number', order: 4 }),
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance tier',
    control: 'select',
    order: 5,
    options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
  }),
});

export type HeroModel = z.infer<typeof heroSchema>;
