import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema } from './recruit.schema';
import { RecruitViewModel } from './recruit.view-model';

/** The recruit screen: a schema-driven form that adds a new hero to the roster. */
@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
  ],
  providers: [RecruitViewModel, provideIcons({ lucideChevronLeft, lucideUserPlus })],
  template: `
    <div class="flex flex-col gap-6">
      <a hlmBtn variant="ghost" routerLink="/roster" class="self-start">
        <ng-icon name="lucideChevronLeft" aria-hidden="true" />
        Back to roster
      </a>

      <header class="min-w-0">
        <h1 class="text-2xl font-semibold">Recruit</h1>
        <p class="text-sm text-muted-foreground">
          New recruits join the roster in reserve, with no missions on record. Example data, for demonstration only.
        </p>
      </header>

      <section hlmCard aria-labelledby="recruit-heading" class="max-w-3xl">
        <div hlmCardHeader>
          <h2 id="recruit-heading" hlmCardTitle>New recruit</h2>
          <p hlmCardDescription>Every field is required except the notes.</p>
        </div>
        <div hlmCardContent>
          <form novalidate class="flex flex-col gap-6" (submit)="vm.save($event)">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div hlmField>
                <label hlmFieldLabel for="recruit-name">{{ meta.name.label }}</label>
                <input hlmInput id="recruit-name" [formField]="vm.form.name" />
                @for (error of vm.form.name().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="recruit-alias">{{ meta.alias.label }}</label>
                <input hlmInput id="recruit-alias" [formField]="vm.form.alias" />
                @for (error of vm.form.alias().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="recruit-power-class">{{ meta.powerClass.label }}</label>
                <hlm-select [formField]="vm.form.powerClass">
                  <hlm-select-trigger class="w-full" buttonId="recruit-power-class">
                    <hlm-select-value />
                  </hlm-select-trigger>
                  <hlm-select-content *hlmSelectPortal>
                    @for (option of meta.powerClass.options ?? []; track option.value) {
                      <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </hlm-select>
                @for (error of vm.form.powerClass().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="recruit-clearance">{{ meta.clearance.label }}</label>
                <hlm-select [formField]="vm.form.clearance">
                  <hlm-select-trigger class="w-full" buttonId="recruit-clearance">
                    <hlm-select-value />
                  </hlm-select-trigger>
                  <hlm-select-content *hlmSelectPortal>
                    @for (option of meta.clearance.options ?? []; track option.value) {
                      <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </hlm-select>
                <p hlmFieldDescription>{{ meta.clearance.help }}</p>
                @for (error of vm.form.clearance().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="recruit-power-index">{{ meta.powerIndex.label }}</label>
                <input hlmInput id="recruit-power-index" type="number" [formField]="vm.form.powerIndex" />
                <p hlmFieldDescription>{{ meta.powerIndex.help }}</p>
                @for (error of vm.form.powerIndex().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <div hlmField class="sm:col-span-2">
                <label hlmFieldLabel for="recruit-notes">{{ meta.notes.label }}</label>
                <textarea hlmTextarea id="recruit-notes" [formField]="vm.form.notes"></textarea>
                @for (error of vm.form.notes().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-2">
              <a hlmBtn variant="outline" routerLink="/roster">Cancel</a>
              <button hlmBtn type="submit">
                <ng-icon name="lucideUserPlus" aria-hidden="true" />
                Add to roster
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `,
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
  protected readonly meta = formMeta(recruitSchema);
}
