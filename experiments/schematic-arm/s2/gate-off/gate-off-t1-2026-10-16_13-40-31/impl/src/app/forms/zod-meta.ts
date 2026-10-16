import type { z } from 'zod';
import type { FormFieldMeta } from './form-field-meta';

/**
 * Read the FormFieldMeta off each field of a zod object schema. Keeps the label,
 * control kind, and placeholder on the schema (one source of truth) so a form
 * component reads them instead of restating them. Pair with `validateStandardSchema`
 * from `@angular/forms/signals` for validation, so shape, rules, and labels all
 * live on the one schema.
 */
export function formMeta<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
): { [K in keyof S['shape']]: FormFieldMeta } {
  const meta: Partial<Record<keyof S['shape'], FormFieldMeta>> = {};
  for (const [name, field] of Object.entries(schema.shape)) {
    meta[name as keyof S['shape']] = (field as z.ZodType).meta() as unknown as FormFieldMeta;
  }
  return meta as { [K in keyof S['shape']]: FormFieldMeta };
}
