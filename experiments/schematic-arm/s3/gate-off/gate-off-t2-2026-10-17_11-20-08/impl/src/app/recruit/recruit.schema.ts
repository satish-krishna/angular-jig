import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import { heroSchema } from '../hero-detail/hero-detail.schema';

/**
 * The recruit form is the hero schema without the Active switch (a recruit starts Active),
 * plus the clearance a new hero is cleared to. Every shared rule and label comes from heroSchema.
 */
export const recruitSchema = heroSchema.omit({ active: true }).extend({
  clearanceTier: z.literal(CLEARANCE_TIERS).meta({
    label: 'Clearance tier',
    control: 'select',
    help: 'Tier 1 is the lowest clearance, tier 5 the highest',
  } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
