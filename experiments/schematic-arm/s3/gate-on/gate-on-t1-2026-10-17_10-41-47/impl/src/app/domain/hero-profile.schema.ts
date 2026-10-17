import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { POWER_CLASSES } from './hero.model';

/**
 * The profile fields the edit and recruit forms share. Each rule and label is written once here,
 * so the two forms cannot drift apart. A form schema spreads this shape and adds its own fields.
 */
export const heroProfileShape = {
  name: z
    .string()
    .trim()
    .min(1, { error: 'Codename is required.' })
    .max(40, { error: 'Codename must be 40 characters or fewer.' })
    .meta({ label: 'Codename', control: 'text', placeholder: 'Public-facing hero name', help: 'Public-facing hero name.', order: 1 } satisfies FormFieldMeta),
  alias: z
    .string()
    .trim()
    .min(1, { error: 'Alter ego is required.' })
    .max(60, { error: 'Alter ego must be 60 characters or fewer.' })
    .meta({ label: 'Alter ego', control: 'text', placeholder: 'Civilian name', order: 2 } satisfies FormFieldMeta),
  powerClass: z
    .enum(POWER_CLASSES, { error: 'Choose a power class.' })
    .meta({
      label: 'Power class',
      control: 'select',
      options: POWER_CLASSES.map((value) => ({ value, label: value })),
      order: 3,
    } satisfies FormFieldMeta),
  powerIndex: z
    .number({ error: 'Power index must be a number.' })
    .int({ error: 'Power index must be a whole number.' })
    .min(0, { error: 'Power index must be between 0 and 100.' })
    .max(100, { error: 'Power index must be between 0 and 100.' })
    .meta({ label: 'Power index (0-100)', control: 'number', order: 4 } satisfies FormFieldMeta),
  notes: z
    .string()
    .trim()
    .max(500, { error: 'Notes must be 500 characters or fewer.' })
    .meta({ label: 'Notes', control: 'textarea', placeholder: 'Dossier notes', order: 5 } satisfies FormFieldMeta),
};
