/**
 * Presentation metadata that rides on a zod field via `.meta()`. Strongly typed,
 * so a missing label is a compile error rather than a runtime surprise. A form
 * component reads this off the schema instead of restating labels and control
 * kinds in a parallel config object.
 */
export type ControlKind = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'switch' | 'textarea';

export interface FormFieldMeta {
  label: string;
  control: ControlKind;
  placeholder?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
  order?: number;
  help?: string;
}
