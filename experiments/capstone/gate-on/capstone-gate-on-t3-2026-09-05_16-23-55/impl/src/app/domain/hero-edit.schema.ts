import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

const powerClasses = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
const statusOptions = ['Active', 'Injured', 'Reserve', 'MIA'] as const;

export const heroEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Hero name',
      order: 1,
    } satisfies FormFieldMeta),

  alias: z
    .string()
    .min(1, 'Alias is required')
    .min(2, 'Alias must be at least 2 characters')
    .max(100, 'Alias must be at most 100 characters')
    .meta({
      label: 'Alias',
      control: 'text',
      placeholder: 'Hero alias or codename',
      order: 2,
    } satisfies FormFieldMeta),

  powerClass: z
    .enum(powerClasses)
    .meta({
      label: 'Power Class',
      control: 'select',
      options: powerClasses.map((pc) => ({ value: pc, label: pc })),
      order: 3,
    } satisfies FormFieldMeta),

  powerIndex: z
    .number()
    .int('Power index must be a whole number')
    .min(0, 'Power index must be at least 0')
    .max(100, 'Power index must be at most 100')
    .meta({
      label: 'Power Index',
      control: 'number',
      placeholder: '0-100',
      order: 4,
    } satisfies FormFieldMeta),

  status: z
    .enum(statusOptions)
    .meta({
      label: 'Status',
      control: 'select',
      options: statusOptions.map((s) => ({ value: s, label: s })),
      order: 5,
    } satisfies FormFieldMeta),

  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .default('')
    .meta({
      label: 'Notes',
      control: 'textarea',
      placeholder: 'Additional notes about this hero',
      order: 6,
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
