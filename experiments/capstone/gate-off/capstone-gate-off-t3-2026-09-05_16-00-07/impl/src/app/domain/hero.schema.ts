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
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Hero name',
      order: 1,
    } satisfies FormFieldMeta),
  alias: z.string()
    .min(1, 'Alias is required')
    .max(100, 'Alias must be 100 characters or less')
    .meta({
      label: 'Alias',
      control: 'text',
      placeholder: 'Public alias',
      order: 2,
    } satisfies FormFieldMeta),
  powerClass: z.enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'])
    .meta({
      label: 'Power Class',
      control: 'select',
      options: powerClassOptions,
      order: 3,
    } satisfies FormFieldMeta),
  powerIndex: z.number()
    .int('Power index must be a whole number')
    .min(0, 'Power index must be at least 0')
    .max(100, 'Power index cannot exceed 100')
    .meta({
      label: 'Power Index',
      control: 'number',
      placeholder: '0-100',
      order: 4,
    } satisfies FormFieldMeta),
  status: z.enum(['Active', 'Injured', 'Reserve', 'MIA'])
    .meta({
      label: 'Status',
      control: 'select',
      options: statusOptions,
      order: 5,
    } satisfies FormFieldMeta),
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .default('')
    .meta({
      label: 'Notes',
      control: 'textarea',
      placeholder: 'Additional notes',
      order: 6,
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroEditSchema>;
