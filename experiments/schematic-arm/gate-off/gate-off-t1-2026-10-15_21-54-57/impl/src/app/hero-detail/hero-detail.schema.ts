import { z } from 'zod';
import { heroAlias, heroName, heroNotes, heroPowerClass, heroPowerIndex } from '../forms/hero-form-fields';

/**
 * Hero edit form. The schema is the single source of truth for the shape, the
 * rules, and the field labels; the form reads its labels off `.meta()`.
 */
export const heroEditSchema = z.object({
  name: heroName,
  alias: heroAlias,
  powerClass: heroPowerClass,
  powerIndex: heroPowerIndex,
  notes: heroNotes,
  active: z.boolean().meta({ label: 'Active', control: 'switch' }),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
