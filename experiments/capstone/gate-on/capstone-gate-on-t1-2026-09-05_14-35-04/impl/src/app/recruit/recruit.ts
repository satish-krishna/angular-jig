import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormRoot, FormField, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports, HlmFieldError } from '@spartan-ng/helm/field';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideUserPlus } from '@ng-icons/lucide';
import { RecruitViewModel } from './recruit-view-model';
import { heroEditSchema } from '../domain/hero.schema';

@Component({
  selector: 'app-recruit',
  imports: [
    CommonModule,
    FormRoot,
    FormField,
    HlmFieldError,
    HlmButtonImports,
    HlmCardImports,
    HlmLabelImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmFieldImports,
    NgIconsModule,
  ],
  providers: [
    RecruitViewModel,
    provideIcons({
      lucideChevronLeft,
      lucideUserPlus,
    }),
  ],
  template: `
    <div class="flex flex-col gap-6 p-4 sm:p-6">
      <!-- Back link -->
      <button hlmBtn variant="ghost" class="w-fit flex items-center gap-2" (click)="vm.cancel()">
        <ng-icon name="lucideChevronLeft" />
        <span>Back</span>
      </button>

      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-foreground">Recruit New Hero</h1>
        <p class="text-muted-foreground mt-2">Add a new hero to the roster</p>
      </div>

      <!-- Form -->
      <div class="max-w-2xl">
        <form [formRoot]="heroForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Hero Information</h3>
            </div>
            <div hlmCardContent class="flex flex-col gap-4">
              <!-- Name -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="name">Name *</label>
                <input
                  hlmInput
                  id="name"
                  type="text"
                  [formField]="heroForm.name"
                  placeholder="Hero name"
                />
                @for (error of heroForm.name().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <!-- Alias -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="alias">Alias *</label>
                <input
                  hlmInput
                  id="alias"
                  type="text"
                  [formField]="heroForm.alias"
                  placeholder="Hero alias or title"
                />
                @for (error of heroForm.alias().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <!-- Power Class -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="powerClass">Power Class *</label>
                <hlm-select>
                  <button hlmBtn hlmSelectTrigger class="justify-start" [formField]="heroForm.powerClass">
                    <span>{{ heroForm.powerClass().value || 'Select class' }}</span>
                  </button>
                  <hlm-select-content>
                    <hlm-select-item value="Aerial">Aerial</hlm-select-item>
                    <hlm-select-item value="Energy">Energy</hlm-select-item>
                    <hlm-select-item value="Psionic">Psionic</hlm-select-item>
                    <hlm-select-item value="Tech">Tech</hlm-select-item>
                    <hlm-select-item value="Mutant">Mutant</hlm-select-item>
                    <hlm-select-item value="Cosmic">Cosmic</hlm-select-item>
                    <hlm-select-item value="Enhanced">Enhanced</hlm-select-item>
                  </hlm-select-content>
                </hlm-select>
                @for (error of heroForm.powerClass().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <!-- Power Index -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="powerIndex">Power Index (0-100) *</label>
                <input
                  hlmInput
                  id="powerIndex"
                  type="number"
                  [formField]="heroForm.powerIndex"
                  placeholder="50"
                />
                @for (error of heroForm.powerIndex().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <!-- Status -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="status">Initial Status *</label>
                <hlm-select>
                  <button hlmBtn hlmSelectTrigger class="justify-start" [formField]="heroForm.status">
                    <span>{{ heroForm.status().value || 'Select status' }}</span>
                  </button>
                  <hlm-select-content>
                    <hlm-select-item value="Active">Active</hlm-select-item>
                    <hlm-select-item value="Injured">Injured</hlm-select-item>
                    <hlm-select-item value="Reserve">Reserve</hlm-select-item>
                    <hlm-select-item value="MIA">MIA</hlm-select-item>
                  </hlm-select-content>
                </hlm-select>
                @for (error of heroForm.status().errors(); track error.kind) {
                  <hlm-field-error>{{ error.message }}</hlm-field-error>
                }
              </div>

              <!-- Notes -->
              <div hlmField orientation="vertical">
                <label hlmLabel for="notes">Notes</label>
                <textarea
                  hlmTextarea
                  id="notes"
                  [formField]="heroForm.notes"
                  placeholder="Additional notes about this hero"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Form actions -->
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button hlmBtn type="button" variant="outline" (click)="vm.cancel()">
              Cancel
            </button>
            <button hlmBtn type="submit" class="flex items-center gap-2">
              <ng-icon name="lucideUserPlus" />
              <span>Add Hero</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);

  protected readonly heroForm = form(
    this.vm.model,
    (path) => validateStandardSchema(path, heroEditSchema)
  );

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.vm.saveHero(this.vm.model());
  }

  private isFormValid(): boolean {
    return !this.heroForm.name().errors().length &&
           !this.heroForm.alias().errors().length &&
           !this.heroForm.powerClass().errors().length &&
           !this.heroForm.powerIndex().errors().length &&
           !this.heroForm.status().errors().length;
  }
}
