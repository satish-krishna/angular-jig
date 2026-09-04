import { z } from 'zod';
import { type FormFieldMeta } from '../forms/form-field-meta';

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Hero name is required')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Enter hero name',
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
