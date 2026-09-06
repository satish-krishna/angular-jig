import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { formMeta } from '../forms/zod-meta';
import { heroSchema, type HeroFormModel } from '../hero/hero.schema';

const meta = formMeta(heroSchema);
const POWER_CLASS_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['powerClass'].options ?? [];

/** Narrow whatever the caller passes down to exactly the schema's shape. */
const project = (value: HeroFormModel): HeroFormModel => ({
  name: value.name,
  alias: value.alias,
  powerClass: value.powerClass,
  power: value.power,
  bio: value.bio,
});

const sameValue = (a: HeroFormModel, b: HeroFormModel) =>
  a.name === b.name &&
  a.alias === b.alias &&
  a.powerClass === b.powerClass &&
  a.power === b.power &&
  a.bio === b.bio;

@Component({
  selector: 'app-hero-form',
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
    <form [formRoot]="heroForm">
      <hlm-field-group>
        <hlm-field>
          <label hlmFieldLabel for="name">{{ meta['name'].label }}</label>
          <input hlmInput id="name" [formField]="heroForm.name" [placeholder]="meta['name'].placeholder ?? ''" />
          @for (error of heroForm.name().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="alias">{{ meta['alias'].label }}</label>
          <input hlmInput id="alias" [formField]="heroForm.alias" [placeholder]="meta['alias'].placeholder ?? ''" />
          @for (error of heroForm.alias().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="powerClass">{{ meta['powerClass'].label }}</label>
          <hlm-select [formField]="heroForm.powerClass" [itemToString]="powerClassToString">
            <hlm-select-trigger buttonId="powerClass" class="w-full">
              <hlm-select-value [placeholder]="meta['powerClass'].placeholder ?? ''" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label>{{ meta['powerClass'].label }}</hlm-select-label>
                @for (option of powerClassOptions; track option.value) {
                  <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
          @for (error of heroForm.powerClass().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="power">{{ meta['power'].label }}</label>
          <input hlmInput id="power" type="number" [formField]="heroForm.power" />
          @for (error of heroForm.power().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <label hlmFieldLabel for="bio">{{ meta['bio'].label }}</label>
          <textarea
            hlmTextarea
            id="bio"
            rows="4"
            [formField]="heroForm.bio"
            [placeholder]="meta['bio'].placeholder ?? ''"
          ></textarea>
          @for (error of heroForm.bio().errors(); track error) {
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
export class HeroForm {
  readonly initialValue = input<HeroFormModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    power: 50,
    bio: '',
  });
  readonly submitLabel = input('Save');
  readonly saveHero = output<HeroFormModel>();
  readonly cancel = output<void>();

  // Compared by value, not identity: a caller that hands us a fresh object with the
  // same contents on every change detection pass must not reseed the form mid-typing.
  private readonly seed = computed(() => project(this.initialValue()), { equal: sameValue });

  // linkedSignal, not signal: an input is not readable from a field initializer, so
  // `signal(this.initialValue())` freezes the form on the default and never shows the
  // hero being edited. This reseeds when the caller genuinely passes a different hero.
  protected readonly model = linkedSignal(() => this.seed());

  // The zod schema is the only validator: shape, rules, and labels all come from it.
  protected readonly heroForm = form(
    this.model,
    (path) => validateStandardSchema(path, heroSchema),
    {
      submission: {
        action: async (field) => {
          this.saveHero.emit(field().value());
        },
      },
    }
  );

  protected readonly meta = meta;
  protected readonly powerClassOptions = POWER_CLASS_OPTIONS;
  protected readonly powerClassToString = (value: string) =>
    POWER_CLASS_OPTIONS.find((option) => option.value === value)?.label ?? '';
}
