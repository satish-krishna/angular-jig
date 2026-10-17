import { z } from 'zod';
import { heroProfileShape } from '../domain/hero-profile.schema';

/**
 * The hero edit form's single source of truth. Shape, rules and labels come from the shared
 * profile shape; the model is `HeroModel`, inferred from this schema. Never restate these rules on the form.
 */
export const heroEditSchema = z.object(heroProfileShape);

export type HeroModel = z.infer<typeof heroEditSchema>;
