import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero';
import { selectOptions } from '../forms/select-options';

/**
 * Hero edit form. This schema is the single source of truth for the form's shape,
 * rules, and field labels; the form reads labels back with `formMeta`.
 */
export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Name', control: 'text', order: 1 }),
  alias: z.string().trim().min(1).meta({ label: 'Alias', control: 'text', order: 2 }),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    order: 3,
    options: selectOptions(POWER_CLASSES),
  }),
  powerIndex: z.number().int().min(0).max(100).meta({
    label: 'Power index',
    control: 'number',
    order: 4,
    help: 'Whole number from 0 to 100.',
  }),
  notes: z.string().max(1000).meta({ label: 'Notes', control: 'textarea', order: 5 }),
  active: z.boolean().meta({
    label: 'Active',
    control: 'switch',
    order: 6,
    help: 'Off places the hero in reserve.',
  }),
});

export type HeroModel = z.infer<typeof heroSchema>;
