import { z } from 'zod';
import { CLEARANCE_TIERS, POWER_CLASSES } from './hero.model';

// Field definitions shared by every hero form. Each field carries its own rule and its
// label on `.meta()`, so a form that reuses a field never restates either.
export const heroNameField = z.string().trim().min(1, 'Name is required').max(60).meta({
  label: 'Name',
  control: 'text',
});

export const heroAliasField = z.string().trim().min(1, 'Alias is required').max(60).meta({
  label: 'Alias',
  control: 'text',
});

export const powerClassField = z.enum(POWER_CLASSES).meta({
  label: 'Power class',
  control: 'select',
  options: POWER_CLASSES.map((value) => ({ value, label: value })),
});

export const powerIndexField = z.number().int().min(0).max(100).meta({
  label: 'Power index',
  control: 'number',
  help: 'Scale of 0 to 100.',
});

export const clearanceField = z.enum(CLEARANCE_TIERS).meta({
  label: 'Clearance',
  control: 'select',
  options: CLEARANCE_TIERS.map((value) => ({ value, label: value })),
});

export const notesField = z.string().trim().max(500, 'Notes run to 500 characters at most').meta({
  label: 'Notes',
  control: 'textarea',
});
