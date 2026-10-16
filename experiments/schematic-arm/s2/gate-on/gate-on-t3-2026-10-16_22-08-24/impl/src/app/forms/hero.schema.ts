import { z } from 'zod';
import { HERO_STATUSES, POWER_CLASSES } from '../domain/hero.model';
import type { FormFieldMeta } from './form-field-meta';

/**
 * The hero form's single source of truth: shape, rules, and field labels. The
 * edit screen and the recruit screen both build on it, so a rule is written once.
 * Validation runs through validateStandardSchema, and the forms read labels via
 * formMeta, so nothing here is restated in a template or a component.
 */
const powerClassOptions = POWER_CLASSES.map((value) => ({ value, label: value }));
const statusOptions = HERO_STATUSES.map((value) => ({ value, label: value }));

export const heroSchema = z.object({
  name: z.string().trim().min(1).meta({ label: 'Codename', control: 'text', placeholder: 'Silverwing' } satisfies FormFieldMeta),
  alias: z.string().trim().min(1).meta({ label: 'Operational alias', control: 'text', placeholder: 'Tessa Harrow' } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({ label: 'Power class', control: 'select', options: powerClassOptions } satisfies FormFieldMeta),
  powerIndex: z.number().int().min(0).max(100).meta({ label: 'Power index', control: 'number', help: '0 to 100' } satisfies FormFieldMeta),
  status: z.enum(HERO_STATUSES).meta({ label: 'Status', control: 'select', options: statusOptions } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;
