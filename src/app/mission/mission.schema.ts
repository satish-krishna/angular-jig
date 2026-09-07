import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const missionSchema = z.object({
  codename: z
    .string()
    .min(1, 'Codename is required')
    .meta({ label: 'Codename', control: 'text', placeholder: 'Mission codename' } satisfies FormFieldMeta),
  objective: z
    .string()
    .min(1, 'Objective is required')
    .meta({ label: 'Objective', control: 'text', placeholder: 'What this mission achieves' } satisfies FormFieldMeta),
  status: z
    .enum(['Planned', 'Active', 'Complete', 'Failed', 'Aborted'])
    .meta({
      label: 'Status',
      control: 'select',
      placeholder: 'Select a status',
      options: [
        { value: 'Planned', label: 'Planned' },
        { value: 'Active', label: 'Active' },
        { value: 'Complete', label: 'Complete' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Aborted', label: 'Aborted' },
      ],
    } satisfies FormFieldMeta),
  priority: z
    .boolean()
    .meta({ label: 'Priority deployment', control: 'switch' } satisfies FormFieldMeta),
  threatId: z
    .string()
    .nullable()
    .meta({ label: 'Linked Threat', control: 'select', placeholder: 'No linked threat' } satisfies FormFieldMeta),
  startedOn: z
    .string()
    .min(1, 'Start date is required')
    .meta({ label: 'Started On', control: 'text', placeholder: 'YYYY-MM-DD' } satisfies FormFieldMeta),
  debrief: z
    .string()
    .meta({ label: 'Debrief', control: 'textarea', placeholder: 'After-action notes' } satisfies FormFieldMeta),
});

export type MissionFormModel = z.infer<typeof missionSchema>;
