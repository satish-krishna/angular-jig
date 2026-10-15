import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [
    RouterLink,
    NgIcon,
    FormField,
    ...HlmButtonImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmSelectImports,
    ...HlmTextareaImports,
  ],
  providers: [RecruitViewModel, provideIcons({ lucideUserPlus })],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Recruit</h1>
        <p class="text-sm text-muted-foreground">
          Add a hero to the roster on Reserve. Example data only: nothing here is sent anywhere.
        </p>
      </header>

      <form class="flex flex-col gap-6" (submit)="$event.preventDefault(); vm.save()">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <hlm-field>
            <label hlmFieldLabel for="recruit-name">{{ vm.meta['name'].label }}</label>
            <input
              hlmInput
              id="recruit-name"
              type="text"
              [placeholder]="vm.meta['name'].placeholder ?? ''"
              [formField]="vm.recruitForm.name"
            />
            @for (e of vm.recruitForm.name().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>

          <hlm-field>
            <label hlmFieldLabel for="recruit-alias">{{ vm.meta['alias'].label }}</label>
            <input
              hlmInput
              id="recruit-alias"
              type="text"
              [placeholder]="vm.meta['alias'].placeholder ?? ''"
              [formField]="vm.recruitForm.alias"
            />
            @for (e of vm.recruitForm.alias().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>

          <hlm-field>
            <label hlmFieldLabel for="recruit-power-class">{{ vm.meta['powerClass'].label }}</label>
            <hlm-select [value]="vm.recruitForm.powerClass().value()" (valueChange)="vm.setPowerClass($event)">
              <hlm-select-trigger buttonId="recruit-power-class" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal>
                @for (option of vm.powerClasses; track option) {
                  <hlm-select-item [value]="option">{{ option }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
            @for (e of vm.recruitForm.powerClass().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>

          <hlm-field>
            <label hlmFieldLabel for="recruit-clearance">{{ vm.meta['clearance'].label }}</label>
            <hlm-select [value]="vm.recruitForm.clearance().value()" (valueChange)="vm.setClearance($event)">
              <hlm-select-trigger buttonId="recruit-clearance" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal>
                @for (option of vm.clearanceTiers; track option) {
                  <hlm-select-item [value]="option">{{ option }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
            @for (e of vm.recruitForm.clearance().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>

          <hlm-field>
            <label hlmFieldLabel for="recruit-power">{{ vm.meta['power'].label }}</label>
            <input hlmInput id="recruit-power" type="number" [formField]="vm.recruitForm.power" />
            <p hlmFieldDescription>{{ vm.meta['power'].help }}</p>
            @for (e of vm.recruitForm.power().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>

          <hlm-field class="sm:col-span-2">
            <label hlmFieldLabel for="recruit-dossier">{{ vm.meta['dossier'].label }}</label>
            <textarea hlmTextarea id="recruit-dossier" rows="5" [formField]="vm.recruitForm.dossier"></textarea>
            <p hlmFieldDescription>{{ vm.meta['dossier'].help }}</p>
            @for (e of vm.recruitForm.dossier().errors(); track e.kind) {
              <hlm-field-error>{{ e.message }}</hlm-field-error>
            }
          </hlm-field>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <a hlmBtn variant="outline" routerLink="/roster">Cancel</a>
          <button hlmBtn type="submit">
            <ng-icon name="lucideUserPlus" />
            Recruit hero
          </button>
        </div>
      </form>
    </section>
  `,
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
