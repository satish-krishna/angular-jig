import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Codename is required')
    .meta({
      label: 'Codename',
      control: 'text',
      placeholder: 'e.g. Silverwing',
    } satisfies FormFieldMeta),
  alias: z
    .string()
    .min(1, 'Civilian alias is required')
    .meta({
      label: 'Civilian alias',
      control: 'text',
      help: 'Real name on file. Use Unknown or Classified where applicable.',
    } satisfies FormFieldMeta),
  powerClass: z.enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced']).meta({
    label: 'Power class',
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
    .min(0, 'Power index must be at least 0')
    .max(100, 'Power index must not exceed 100')
    .meta({ label: 'Power index', control: 'number', help: '0 to 100.' } satisfies FormFieldMeta),
  status: z.enum(['Active', 'Injured', 'Reserve', 'MIA']).meta({
    label: 'Status',
    control: 'select',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Injured', label: 'Injured' },
      { value: 'Reserve', label: 'Reserve' },
      { value: 'MIA', label: 'MIA' },
    ],
  } satisfies FormFieldMeta),
  clearance: z.enum(['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5']).meta({
    label: 'Clearance tier',
    control: 'select',
    options: [
      { value: 'Tier 1', label: 'Tier 1' },
      { value: 'Tier 2', label: 'Tier 2' },
      { value: 'Tier 3', label: 'Tier 3' },
      { value: 'Tier 4', label: 'Tier 4' },
      { value: 'Tier 5', label: 'Tier 5' },
    ],
  } satisfies FormFieldMeta),
  notes: z
    .string()
    .min(1, 'Dossier notes is required')
    .meta({
      label: 'Dossier notes',
      control: 'textarea',
      placeholder: 'Role, strengths, deployment limits',
    } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
