import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({ label: 'Name', control: 'text' } satisfies FormFieldMeta),
  alias: z
    .string()
    .min(1, 'Alias is required')
    .meta({ label: 'Alias', control: 'text' } satisfies FormFieldMeta),
  powerClass: z
    .enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'])
    .meta({
      label: 'Power Class',
      control: 'select',
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
  bio: z
    .string()
    .optional()
    .meta({ label: 'Bio', control: 'textarea', placeholder: 'Origin story' } satisfies FormFieldMeta),
});

export type HeroFormModel = z.infer<typeof heroSchema>;
