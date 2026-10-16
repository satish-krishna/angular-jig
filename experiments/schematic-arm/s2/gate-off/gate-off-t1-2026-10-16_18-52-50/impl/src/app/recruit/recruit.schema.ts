import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { heroFields } from '../forms/hero-fields.schema';

/**
 * The recruit form. It shares the hero fields with the edit form and adds the clearance
 * tier a new hero is filed under. The schema is the single source of truth for the shape.
 */
export const recruitSchema = z.object({
  ...heroFields,
  clearanceTier: z.union(CLEARANCE_TIERS.map((tier) => z.literal(tier))).meta({
    label: 'Clearance tier',
    control: 'select',
    options: CLEARANCE_TIERS.map((tier) => ({ value: String(tier), label: `Tier ${tier}` })),
    help: 'Tier 1 is the lowest clearance. Recruits start on Reserve until they are cleared.',
  } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
