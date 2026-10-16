import { z } from 'zod';
import { heroProfileShape } from '../forms/hero-profile.schema';

// The edit form's single source of truth: the shared profile plus the Active switch.
export const heroDetailSchema = z.object({
  ...heroProfileShape,
  active: z.boolean().meta({
    label: 'Active',
    control: 'checkbox',
    help: 'Active heroes can be deployed.',
  }),
});

export type HeroModel = z.infer<typeof heroDetailSchema>;
