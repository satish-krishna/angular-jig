import { z } from 'zod';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { heroSchema } from '../forms/hero.schema';

/**
 * The recruit form. It takes the rules and labels of the fields a new hero shares
 * with the edit form straight from heroSchema, and adds the one field enlistment
 * needs: a starting clearance tier. Status is not asked for; every recruit starts
 * on Reserve.
 */
export const recruitSchema = heroSchema
  .pick({ name: true, alias: true, powerClass: true, powerIndex: true })
  .extend({
    clearanceTier: z.literal(CLEARANCE_TIERS).meta({ label: 'Clearance tier', control: 'number', help: '1 to 5' } satisfies FormFieldMeta),
  });

export type RecruitModel = z.infer<typeof recruitSchema>;
