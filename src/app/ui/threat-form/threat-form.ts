import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import type { FormFieldMeta } from '../../forms/form-field-meta';
import { formMeta } from '../../forms/zod-meta';
import { threatSchema, type ThreatFormModel } from '../../threat/threat.schema';

const meta = formMeta(threatSchema);
const CATEGORY_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['category'].options ?? [];
const LEVEL_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['level'].options ?? [];
const STATUS_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['status'].options ?? [];

/** Narrow whatever the caller passes down to exactly the schema's shape. */
const project = (value: ThreatFormModel): ThreatFormModel => ({
  designation: value.designation,
  category: value.category,
  level: value.level,
  status: value.status,
  location: value.location,
  firstSeenOn: value.firstSeenOn,
  notes: value.notes,
});

const sameValue = (a: ThreatFormModel, b: ThreatFormModel) =>
  a.designation === b.designation &&
  a.category === b.category &&
  a.level === b.level &&
  a.status === b.status &&
  a.location === b.location &&
  a.firstSeenOn === b.firstSeenOn &&
  a.notes === b.notes;

@Component({
  selector: 'app-threat-form',
  imports: [
    FormRoot,
    FormField,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmTextareaImports,
  ],
  templateUrl: './threat-form.html',
  styleUrl: './threat-form.css',
})
export class ThreatForm {
  readonly initialValue = input<ThreatFormModel>({
    designation: '',
    category: 'Kaiju',
    level: 'Low',
    status: 'Active',
    location: '',
    firstSeenOn: '',
    notes: '',
  });
  readonly submitLabel = input('Save');
  readonly saveThreat = output<ThreatFormModel>();
  readonly cancel = output<void>();

  // Compared by value, not identity: a caller that hands us a fresh object with the
  // same contents on every change detection pass must not reseed the form mid-typing.
  private readonly seed = computed(() => project(this.initialValue()), { equal: sameValue });

  // linkedSignal, not signal: an input is not readable from a field initializer, so
  // `signal(this.initialValue())` freezes the form on the default and never shows the
  // threat being edited. This reseeds when the caller genuinely passes a different threat.
  protected readonly model = linkedSignal(() => this.seed());

  // The zod schema is the only validator: shape, rules, and labels all come from it.
  protected readonly threatForm = form(
    this.model,
    (path) => validateStandardSchema(path, threatSchema),
    {
      submission: {
        action: async (field) => {
          this.saveThreat.emit(field().value());
        },
      },
    }
  );

  protected readonly meta = meta;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly levelOptions = LEVEL_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly categoryToString = (value: string) =>
    CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? '';
  protected readonly levelToString = (value: string) =>
    LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? '';
  protected readonly statusToString = (value: string) =>
    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? '';
}
