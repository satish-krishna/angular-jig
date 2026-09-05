import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
const STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .meta({
      label: 'Name',
      control: 'text',
      placeholder: 'Hero name',
    } satisfies FormFieldMeta),
  alias: z
    .string()
    .min(1, 'Alias is required')
    .meta({
      label: 'Alias',
      control: 'text',
      placeholder: 'Operating alias',
    } satisfies FormFieldMeta),
  powerClass: z
    .enum(POWER_CLASSES)
    .meta({
      label: 'Power Class',
      control: 'select',
      options: POWER_CLASSES.map((c) => ({ value: c, label: c })),
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
    .enum(STATUSES)
    .meta({
      label: 'Status',
      control: 'select',
      options: STATUSES.map((s) => ({ value: s, label: s })),
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
