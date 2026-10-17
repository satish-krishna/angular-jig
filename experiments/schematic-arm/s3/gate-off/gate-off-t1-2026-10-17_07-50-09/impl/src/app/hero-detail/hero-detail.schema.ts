import { z } from 'zod';
import {
  heroAliasField,
  heroNameField,
  notesField,
  powerClassField,
  powerIndexField,
} from '../domain/hero-fields';

// Edit-form schema for the hero detail screen. The shared hero fields come from the domain;
// the one field this form owns is the roster switch. The schema is the single source of
// truth for shape, rules, and field labels; the form reads labels off `.meta()`.
export const heroEditSchema = z.object({
  name: heroNameField,
  alias: heroAliasField,
  powerClass: powerClassField,
  powerIndex: powerIndexField,
  notes: notesField,
  active: z.boolean().meta({
    label: 'Active on roster',
    control: 'switch',
    help: 'Switching this off moves an active hero to Reserve.',
  }),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
