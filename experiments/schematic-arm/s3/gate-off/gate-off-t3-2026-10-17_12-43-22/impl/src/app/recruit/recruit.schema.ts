import { z } from 'zod';
import { CLEARANCE_TIERS, POWER_CLASSES } from '../domain/hero.model';

// Single source of truth for the recruit form: shape, rules, and field labels.
export const recruitSchema = z.object({
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
  clearanceTier: z.literal(CLEARANCE_TIERS).meta({
    label: 'Clearance tier',
    control: 'select',
    order: 5,
    help: 'Tier 1 is the lowest clearance, Tier 5 the highest.',
  }),
  notes: z.string().trim().max(500).meta({ label: 'Notes', control: 'textarea', order: 6 }),
});

export type RecruitModel = z.infer<typeof recruitSchema>;

export const CLEARANCE_OPTIONS = CLEARANCE_TIERS.map((tier) => ({ value: tier, label: `Tier ${tier}` }));
