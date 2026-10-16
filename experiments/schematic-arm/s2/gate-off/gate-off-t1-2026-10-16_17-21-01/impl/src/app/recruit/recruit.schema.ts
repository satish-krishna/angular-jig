import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';

// The recruit form's single source of truth: shape, rules, and field labels. Labels
// and control kinds ride on each field via .meta() (read them with formMeta).
export const recruitSchema = z.object({
  name: z.string().min(1).meta({ label: 'Hero name', control: 'text', order: 1 } satisfies FormFieldMeta),
  alias: z.string().min(1).meta({ label: 'Civilian alias', control: 'text', order: 2 } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    order: 4,
    help: 'Scaled 0 to 100.',
  } satisfies FormFieldMeta),
  clearanceTier: z.number().int().min(1).max(5).meta({
    label: 'Clearance tier',
    control: 'number',
    order: 5,
    help: 'Tier 1 (open) to tier 5 (classified).',
  } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
