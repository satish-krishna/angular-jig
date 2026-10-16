import { z } from 'zod';
import { CLEARANCE_TIERS, POWER_CLASSES } from '../domain/hero';
import { selectOptions } from '../forms/select-options';

/**
 * Recruit form. The schema is the single source of truth for the form's shape, rules,
 * and field labels; the form reads labels back with `formMeta`.
 */
export const recruitSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Hero name', control: 'text', order: 1 }),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text', order: 2 }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: selectOptions(POWER_CLASSES),
  }),
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance',
    control: 'select',
    order: 4,
    options: selectOptions(CLEARANCE_TIERS),
    help: 'Tier 1 is the lowest; Tier 5 gates cosmic-tier responses.',
  }),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    order: 5,
    help: 'Whole number from 0 to 100.',
  }),
  notes: z.string().max(1000).meta({ label: 'Dossier notes', control: 'textarea', order: 6 }),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
