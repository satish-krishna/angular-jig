import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

const powerClasses = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;

const createFieldMeta = (meta: FormFieldMeta) => meta as unknown as Record<string, unknown>;

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .meta(createFieldMeta({
      label: 'Name',
      control: 'text',
      placeholder: 'Enter hero name',
      order: 1,
    })),

  alias: z
    .string()
    .min(1, 'Alias is required')
    .min(2, 'Alias must be at least 2 characters')
    .meta(createFieldMeta({
      label: 'Alias',
      control: 'text',
      placeholder: 'Enter hero alias',
      order: 2,
    })),

  powerClass: z
    .enum(powerClasses)
    .meta(createFieldMeta({
      label: 'Power Class',
      control: 'select',
      options: powerClasses.map((pc) => ({ value: pc, label: pc })),
      order: 3,
    })),

  powerIndex: z
    .number()
    .int('Power index must be a whole number')
    .min(0, 'Power index must be at least 0')
    .max(100, 'Power index cannot exceed 100')
    .meta(createFieldMeta({
      label: 'Power Index',
      control: 'number',
      placeholder: '0-100',
      order: 4,
    })),

  notes: z
    .string()
    .optional()
    .default('')
    .meta(createFieldMeta({
      label: 'Notes',
      control: 'textarea',
      placeholder: 'Add any notes about this hero',
      order: 5,
    })),

  isActive: z
    .boolean()
    .default(true)
    .meta(createFieldMeta({
      label: 'Active Status',
      control: 'checkbox',
      order: 6,
    })),
});

export type HeroModel = z.infer<typeof heroSchema>;
