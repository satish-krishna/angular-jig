import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { heroDetailSchema } from '../hero-detail/hero-detail.schema';

/**
 * A new recruit is a hero record plus the clearance they are granted. Every field the
 * dossier form already validates is inherited from `heroDetailSchema`, not restated here.
 */
export const recruitSchema = heroDetailSchema.extend({
  clearance: z.enum(CLEARANCE_TIERS).meta({
    label: 'Clearance',
    control: 'select',
    options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
    order: 6,
  } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
