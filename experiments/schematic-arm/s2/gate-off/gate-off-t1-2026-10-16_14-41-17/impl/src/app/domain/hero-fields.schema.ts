import { z } from 'zod';
import { POWER_CLASSES } from './hero';

/**
 * The fields every hero form shares: the edit form on the dossier and the recruit
 * intake. One definition keeps their rules and labels in step. Each form spreads
 * these into its own z.object and adds the fields that only it carries.
 */
export const heroFieldSchemas = {
  name: z.string().trim().min(1).max(60).meta({ label: 'Name', control: 'text', placeholder: 'Codename' }),
  alias: z.string().trim().min(1).max(60).meta({ label: 'Alias', control: 'text', placeholder: 'Civilian name' }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
  }),
  powerIndex: z.number().int().min(0).max(100).meta({ label: 'Power index', control: 'number' }),
  notes: z.string().max(500).meta({ label: 'Notes', control: 'textarea' }),
};
