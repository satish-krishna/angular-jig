import type { z } from 'zod';
import type { FormFieldMeta } from './form-field-meta';

/**
 * Read the FormFieldMeta off each field of a zod object schema. Keeps the label,
 * control kind, and placeholder on the schema (one source of truth) so a form
 * component reads them instead of restating them. Pair with `validateStandardSchema`
 * from `@angular/forms/signals` for validation, so shape, rules, and labels all
 * live on the one schema.
 */
export function formMeta(schema: z.ZodObject<z.ZodRawShape>): Record<string, FormFieldMeta> {
  const meta: Record<string, FormFieldMeta> = {};
  for (const [name, field] of Object.entries(schema.shape)) {
    meta[name] = (field as z.ZodType).meta() as unknown as FormFieldMeta;
  }
  return meta;
}
