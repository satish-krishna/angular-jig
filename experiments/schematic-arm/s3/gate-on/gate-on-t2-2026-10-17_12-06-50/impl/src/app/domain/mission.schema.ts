import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

// The deploy form names a hero and a threat. The select options come from the live roster and threat list,
// so the schema carries only the labels and the rule that both are chosen.
export const deploySchema = z.object({
  heroId: z.string().min(1).meta({ label: 'Hero', control: 'select' } satisfies FormFieldMeta),
  threatId: z.string().min(1).meta({ label: 'Threat', control: 'select' } satisfies FormFieldMeta),
});

export type DeployModel = z.infer<typeof deploySchema>;
