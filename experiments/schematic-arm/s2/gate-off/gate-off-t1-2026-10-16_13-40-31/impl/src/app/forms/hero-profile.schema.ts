import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';

// The profile fields a hero carries. Recruiting and editing both validate these, so the
// shape, rules and labels are written once and each form adds only what it alone needs.
export const heroProfileShape = {
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name.')
    .meta({ label: 'Name', control: 'text', placeholder: 'Public-facing hero name' }),
  alias: z
    .string()
    .trim()
    .min(1, 'Enter an alias.')
    .meta({ label: 'Alias', control: 'text', placeholder: 'Civilian identity' }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  }),
  powerIndex: z
    .number('Enter a power index.')
    .int('Use a whole number.')
    .min(0, 'Power index must be between 0 and 100.')
    .max(100, 'Power index must be between 0 and 100.')
    .meta({
      label: 'Power index',
      control: 'number',
      help: 'Between 0 and 100.',
    }),
  notes: z
    .string()
    .trim()
    .max(500, 'Keep notes under 500 characters.')
    .meta({ label: 'Notes', control: 'textarea', placeholder: 'Field notes for the dossier' }),
};
