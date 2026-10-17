import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import { heroProfileShape } from '../domain/hero-profile.schema';
import type { FormFieldMeta } from '../forms/form-field-meta';

/**
 * The recruit form's single source of truth: the shared profile fields plus the clearance tier
 * a new recruit starts at. The model is `RecruitModel`, inferred from this schema.
 */
export const recruitSchema = z.object({
  ...heroProfileShape,
  clearanceTier: z
    .enum(CLEARANCE_TIERS, { error: 'Choose a clearance tier.' })
    .meta({
      label: 'Clearance tier',
      control: 'select',
      options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
      order: 4,
    } satisfies FormFieldMeta),
});

export type RecruitModel = z.infer<typeof recruitSchema>;
