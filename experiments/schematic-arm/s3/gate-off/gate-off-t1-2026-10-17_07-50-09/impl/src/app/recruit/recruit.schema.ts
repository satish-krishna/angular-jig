import { z } from 'zod';
import {
  clearanceField,
  heroAliasField,
  heroNameField,
  notesField,
  powerClassField,
  powerIndexField,
} from '../domain/hero-fields';

// Recruit-form schema. Every field a new hero is given at intake, shared with the edit form
// where the two overlap. The model type below is inferred, so the shape lives in one place.
export const recruitSchema = z.object({
  name: heroNameField,
  alias: heroAliasField,
  powerClass: powerClassField,
  powerIndex: powerIndexField,
  clearance: clearanceField,
  notes: notesField,
});

export type RecruitModel = z.infer<typeof recruitSchema>;
