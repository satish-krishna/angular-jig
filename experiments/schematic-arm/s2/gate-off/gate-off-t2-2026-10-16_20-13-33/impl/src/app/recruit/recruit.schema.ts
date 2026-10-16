import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import { heroSchema } from '../domain/hero.schema';

/**
 * The recruit form's schema: the shared hero fields plus the clearance a recruit is
 * given. It extends `heroSchema`, so the name, alias, class, and power rules are stated once.
 */
export const recruitSchema = heroSchema.extend({
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance',
    control: 'select',
    options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
  }),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
