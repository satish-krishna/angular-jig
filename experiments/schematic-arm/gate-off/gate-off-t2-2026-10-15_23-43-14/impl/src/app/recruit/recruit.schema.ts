import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero';
import { heroSchema } from '../domain/hero.schema';
import type { FormFieldMeta } from '../forms/form-field-meta';

const clearanceOptions = CLEARANCE_TIERS.map((value) => ({ value, label: value }));

/**
 * The recruit form. It is the hero schema plus a clearance tier: the shared fields are not
 * restated, so a rule changed in the hero schema applies to recruits too.
 */
export const recruitSchema = heroSchema.extend({
  clearance: z.enum(CLEARANCE_TIERS).meta({ label: 'Clearance', control: 'select', options: clearanceOptions } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
