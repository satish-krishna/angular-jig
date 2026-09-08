import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { formMeta } from '../forms/zod-meta';
import { threatSchema, type ThreatFormModel } from '../threat/threat.schema';

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
  template: `
    <form [formRoot]="threatForm">
      <hlm-field-group>
        <hlm-field>
          <label hlmFieldLabel for="designation">{{ meta['designation'].label }}</label>
          <input hlmInput id="designation" [formField]="threatForm.designation" [placeholder]="meta['designation'].placeholder ?? ''" />
          @for (error of threatForm.designation().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="category">{{ meta['category'].label }}</label>
          <hlm-select [formField]="threatForm.category" [itemToString]="categoryToString">
            <hlm-select-trigger buttonId="category" class="w-full">
              <hlm-select-value [placeholder]="meta['category'].placeholder ?? ''" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label>{{ meta['category'].label }}</hlm-select-label>
                @for (option of categoryOptions; track option.value) {
                  <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
          @for (error of threatForm.category().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="level">{{ meta['level'].label }}</label>
          <hlm-select [formField]="threatForm.level" [itemToString]="levelToString">
            <hlm-select-trigger buttonId="level" class="w-full">
              <hlm-select-value [placeholder]="meta['level'].placeholder ?? ''" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label>{{ meta['level'].label }}</hlm-select-label>
                @for (option of levelOptions; track option.value) {
                  <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
          @for (error of threatForm.level().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="status">{{ meta['status'].label }}</label>
          <hlm-select [formField]="threatForm.status" [itemToString]="statusToString">
            <hlm-select-trigger buttonId="status" class="w-full">
              <hlm-select-value [placeholder]="meta['status'].placeholder ?? ''" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label>{{ meta['status'].label }}</hlm-select-label>
                @for (option of statusOptions; track option.value) {
                  <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
          @for (error of threatForm.status().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="location">{{ meta['location'].label }}</label>
          <input hlmInput id="location" [formField]="threatForm.location" [placeholder]="meta['location'].placeholder ?? ''" />
          @for (error of threatForm.location().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="firstSeenOn">{{ meta['firstSeenOn'].label }}</label>
          <input hlmInput id="firstSeenOn" [formField]="threatForm.firstSeenOn" [placeholder]="meta['firstSeenOn'].placeholder ?? ''" />
          @for (error of threatForm.firstSeenOn().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="notes">{{ meta['notes'].label }}</label>
          <textarea
            hlmTextarea
            id="notes"
            rows="4"
            [formField]="threatForm.notes"
            [placeholder]="meta['notes'].placeholder ?? ''"
          ></textarea>
          @for (error of threatForm.notes().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field orientation="horizontal">
          <button hlmBtn type="submit">{{ submitLabel() }}</button>
          <button hlmBtn type="button" variant="outline" (click)="cancel.emit()">Cancel</button>
        </hlm-field>
      </hlm-field-group>
    </form>
  `,
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
