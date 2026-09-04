import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const heroDetailSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Enter hero name',
    } satisfies FormFieldMeta),
});

export type HeroDetailModel = z.infer<typeof heroDetailSchema>;
