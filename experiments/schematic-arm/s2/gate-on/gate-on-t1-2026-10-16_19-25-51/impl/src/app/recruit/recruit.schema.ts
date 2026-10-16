import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import { heroSchema } from '../domain/hero.schema';

/**
 * The recruit form's schema. It is the hero edit schema plus a clearance tier, so
 * the shared field rules and labels are not restated here.
 */
export const recruitSchema = heroSchema.extend({
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance',
    control: 'select',
    order: 5,
    options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
  }),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
