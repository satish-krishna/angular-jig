import { z } from 'zod';
import { heroAlias, heroName, heroNotes, heroPowerClass, heroPowerIndex } from '../forms/hero-form-fields';

/**
 * Recruit form. The schema is the single source of truth for the shape, the rules, and the
 * field labels. Shares its hero fields with the edit form, so a rule changed there changes here.
 */
export const recruitSchema = z.object({
  name: heroName,
  alias: heroAlias,
  powerClass: heroPowerClass,
  powerIndex: heroPowerIndex,
  clearance: z.number().int().min(1).max(5).meta({ label: 'Clearance tier', control: 'number' }),
  notes: heroNotes,
});

export type RecruitModel = z.infer<typeof recruitSchema>;
