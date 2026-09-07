import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const threatSchema = z.object({
  designation: z
    .string()
    .min(1, 'Designation is required')
    .meta({ label: 'Designation', control: 'text', placeholder: 'Threat designation' } satisfies FormFieldMeta),
  category: z
    .enum(['Kaiju', 'Rogue', 'Anomaly', 'Syndicate', 'Cosmic'])
    .meta({
      label: 'Category',
      control: 'select',
      placeholder: 'Select a category',
      options: [
        { value: 'Kaiju', label: 'Kaiju' },
        { value: 'Rogue', label: 'Rogue' },
        { value: 'Anomaly', label: 'Anomaly' },
        { value: 'Syndicate', label: 'Syndicate' },
        { value: 'Cosmic', label: 'Cosmic' },
      ],
    } satisfies FormFieldMeta),
  level: z
    .enum(['Low', 'Moderate', 'Severe', 'Critical'])
    .meta({
      label: 'Threat Level',
      control: 'select',
      placeholder: 'Select a level',
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Severe', label: 'Severe' },
        { value: 'Critical', label: 'Critical' },
      ],
    } satisfies FormFieldMeta),
  status: z
    .enum(['Active', 'Contained', 'Neutralized'])
    .meta({
      label: 'Status',
      control: 'select',
      placeholder: 'Select a status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Contained', label: 'Contained' },
        { value: 'Neutralized', label: 'Neutralized' },
      ],
    } satisfies FormFieldMeta),
  location: z
    .string()
    .min(1, 'Location is required')
    .meta({ label: 'Location', control: 'text', placeholder: 'Last known location' } satisfies FormFieldMeta),
  firstSeenOn: z
    .string()
    .min(1, 'First sighting is required')
    .meta({ label: 'First Seen', control: 'text', placeholder: 'YYYY-MM-DD' } satisfies FormFieldMeta),
  // Present but free to be empty: a textarea can only ever produce a string, so
  // `.optional()` would leak an `undefined` the control can never emit.
  notes: z
    .string()
    .meta({ label: 'Notes', control: 'textarea', placeholder: 'Assessment notes' } satisfies FormFieldMeta),
});

export type ThreatFormModel = z.infer<typeof threatSchema>;
