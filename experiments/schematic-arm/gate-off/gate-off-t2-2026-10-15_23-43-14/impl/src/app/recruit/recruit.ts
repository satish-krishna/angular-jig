import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { RecruitViewModel } from './recruit.view-model';

/**
 * Recruit screen: a form that adds a hero to the roster. The fields come from the zod schema
 * and the save goes through the ViewModel. A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-recruit',
  imports: [NgIcon, RouterLink, FormField, HlmButton, HlmCardImports, HlmFieldImports, HlmInput, HlmSelectImports],
  providers: [RecruitViewModel, provideIcons({ lucideUserPlus })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Recruit</h1>
        <p class="text-sm text-muted-foreground">Enrol a new hero. They join the roster in reserve.</p>
      </header>

      <div hlmCard class="max-w-2xl">
        <div hlmCardHeader>
          <h2 hlmCardTitle>New recruit</h2>
        </div>
        <form class="flex flex-col gap-6" (submit)="$event.preventDefault(); vm.save()">
          <div hlmCardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div hlmField>
              <label hlmFieldLabel for="recruit-name">{{ vm.labels['name'].label }}</label>
              <input hlmInput id="recruit-name" [formField]="vm.recruitForm.name" />
              @for (e of vm.recruitForm.name().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="recruit-alias">{{ vm.labels['alias'].label }}</label>
              <input hlmInput id="recruit-alias" [formField]="vm.recruitForm.alias" />
              @for (e of vm.recruitForm.alias().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="recruit-power-class">{{ vm.labels['powerClass'].label }}</label>
              <hlm-select [value]="vm.recruitForm.powerClass().value()" (valueChange)="vm.setPowerClass($event)">
                <hlm-select-trigger id="recruit-power-class" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal>
                  @for (option of vm.powerClassOptions; track option.value) {
                    <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
              @for (e of vm.recruitForm.powerClass().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="recruit-clearance">{{ vm.labels['clearance'].label }}</label>
              <hlm-select [value]="vm.recruitForm.clearance().value()" (valueChange)="vm.setClearance($event)">
                <hlm-select-trigger id="recruit-clearance" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal>
                  @for (option of vm.clearanceOptions; track option.value) {
                    <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
              @for (e of vm.recruitForm.clearance().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>

            <div hlmField class="sm:col-span-2">
              <label hlmFieldLabel for="recruit-power">{{ vm.labels['powerIndex'].label }}</label>
              <input hlmInput id="recruit-power" type="number" [formField]="vm.recruitForm.powerIndex" />
              @for (e of vm.recruitForm.powerIndex().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2 border-t border-border p-6">
            <a hlmBtn variant="outline" routerLink="/roster">Cancel</a>
            <button hlmBtn type="submit">
              <ng-icon name="lucideUserPlus" />
              Recruit hero
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
