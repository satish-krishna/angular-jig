import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

const powerClassOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Aerial', label: 'Aerial' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Psionic', label: 'Psionic' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Mutant', label: 'Mutant' },
  { value: 'Cosmic', label: 'Cosmic' },
  { value: 'Enhanced', label: 'Enhanced' },
];

const statusOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Active', label: 'Active' },
  { value: 'Injured', label: 'Injured' },
  { value: 'Reserve', label: 'Reserve' },
  { value: 'MIA', label: 'MIA' },
];

export const heroEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Hero name',
    } satisfies FormFieldMeta),

  alias: z
    .string()
    .min(1, 'Alias is required')
    .min(2, 'Alias must be at least 2 characters')
    .meta({
      label: 'Alias',
      control: 'text',
      placeholder: 'Hero alias',
    } satisfies FormFieldMeta),

  powerClass: z
    .enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'])
    .meta({
      label: 'Power Class',
      control: 'select',
      options: powerClassOptions,
    } satisfies FormFieldMeta),

  powerIndex: z
    .number()
    .int()
    .min(0, 'Power index must be at least 0')
    .max(100, 'Power index must not exceed 100')
    .meta({
      label: 'Power Index',
      control: 'number',
      placeholder: '0-100',
    } satisfies FormFieldMeta),

  status: z
    .enum(['Active', 'Injured', 'Reserve', 'MIA'])
    .meta({
      label: 'Status',
      control: 'select',
      options: statusOptions,
    } satisfies FormFieldMeta),

  notes: z
    .string()
    .optional()
    .default('')
    .meta({
      label: 'Notes',
      control: 'textarea',
      placeholder: 'Additional notes',
    } satisfies FormFieldMeta),

  active: z
    .boolean()
    .default(true)
    .meta({
      label: 'Active in roster',
      control: 'checkbox',
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
