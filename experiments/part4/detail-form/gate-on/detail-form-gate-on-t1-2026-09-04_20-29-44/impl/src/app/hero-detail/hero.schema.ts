import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const heroSchema = z.object({
  name: z.string().min(1, 'Name is required').meta({ label: 'Hero Name', control: 'text' } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
