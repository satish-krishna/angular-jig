import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({ label: 'Name', control: 'text', placeholder: 'Hero name' } satisfies FormFieldMeta),
  alias: z
    .string()
    .min(1, 'Alias is required')
    .meta({ label: 'Alias', control: 'text', placeholder: 'Hero alias' } satisfies FormFieldMeta),
  powerClass: z
    .enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'])
    .meta({
      label: 'Power Class',
      control: 'select',
      placeholder: 'Select a power class',
      options: [
        { value: 'Aerial', label: 'Aerial' },
        { value: 'Energy', label: 'Energy' },
        { value: 'Psionic', label: 'Psionic' },
        { value: 'Tech', label: 'Tech' },
        { value: 'Mutant', label: 'Mutant' },
        { value: 'Cosmic', label: 'Cosmic' },
        { value: 'Enhanced', label: 'Enhanced' },
      ],
    } satisfies FormFieldMeta),
  power: z
    .number()
    .min(0, 'Power must be at least 0')
    .max(100, 'Power must not exceed 100')
    .meta({ label: 'Power Index', control: 'number' } satisfies FormFieldMeta),
  // Present but free to be empty: a textarea can only ever produce a string, so
  // `.optional()` would leak an `undefined` the control can never actually emit.
  bio: z
    .string()
    .meta({ label: 'Bio', control: 'textarea', placeholder: 'Origin story' } satisfies FormFieldMeta),
});

export type HeroFormModel = z.infer<typeof heroSchema>;
