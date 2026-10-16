import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero';
import { heroFieldSchemas } from '../domain/hero-fields.schema';

/**
 * The recruit intake form. The shared hero fields come from one place; intake adds
 * the clearance a new recruit is cleared to.
 */
export const recruitSchema = z.object({
  ...heroFieldSchemas,
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance',
    control: 'select',
    options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
  }),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
