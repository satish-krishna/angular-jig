import { z } from 'zod';

const powerClassOptions = [
  { value: 'Aerial', label: 'Aerial' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Psionic', label: 'Psionic' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Mutant', label: 'Mutant' },
  { value: 'Cosmic', label: 'Cosmic' },
  { value: 'Enhanced', label: 'Enhanced' },
] as const;

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Injured', label: 'Injured' },
  { value: 'Reserve', label: 'Reserve' },
  { value: 'MIA', label: 'MIA' },
] as const;

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Hero name is required')
    .meta({ label: 'Codename', control: 'text', placeholder: 'Hero name' }),
  alias: z
    .string()
    .min(1, 'Alter ego is required')
    .meta({ label: 'Alter ego', control: 'text', placeholder: 'Real name or alias' }),
  powerClass: z
    .enum(['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'])
    .meta({ label: 'Power class', control: 'select', options: powerClassOptions }),
  powerIndex: z
    .number()
    .min(0, 'Power must be at least 0')
    .max(100, 'Power cannot exceed 100')
    .meta({ label: 'Power index (0-100)', control: 'number', placeholder: '0-100' }),
  bio: z
    .string()
    .optional()
    .meta({ label: 'Field notes', control: 'textarea', placeholder: 'Field observations and notes' }),
  status: z
    .enum(['Active', 'Injured', 'Reserve', 'MIA'])
    .meta({ label: 'Status', control: 'select', options: statusOptions }),
});

export type HeroModel = z.infer<typeof heroSchema>;
