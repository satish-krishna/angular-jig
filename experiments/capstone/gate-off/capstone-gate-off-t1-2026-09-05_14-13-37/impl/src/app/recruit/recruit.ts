import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { RecruitViewModel } from './recruit.viewmodel';

@Component({
  selector: 'app-recruit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgIconsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTooltipImports,
  ],
  providers: [
    RecruitViewModel,
    provideIcons({
      lucideChevronLeft,
    }),
  ],
  template: `
    <div class="flex-1 flex flex-col overflow-auto bg-background">
      <!-- Back Link -->
      <div class="px-6 py-4 border-b border-border bg-background">
        <a
          routerLink="/dashboard"
          class="inline-flex items-center gap-1 text-sm text-primary hover:opacity-80"
        >
          <ng-icon name="lucideChevronLeft" class="w-4 h-4" />
          <span>Back to dashboard</span>
        </a>
      </div>

      <!-- Page Header -->
      <div class="px-6 py-6 border-b border-border bg-background">
        <h1 class="text-3xl font-bold text-foreground mb-1">Recruit Hero</h1>
        <p class="text-sm text-muted-foreground">Add a new hero to the roster</p>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-auto">
        <div class="px-6 py-6 max-w-2xl">
          <div class="bg-card border border-border rounded-lg p-6 shadow-sm">
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Codename Field -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Codename
                </label>
                <input
                  hlmInput
                  type="text"
                  placeholder="Hero name (e.g., Silverwing)"
                  [value]="vm.getFormValue('name') || ''"
                  (input)="onNameChange($event)"
                  class="w-full"
                />
                @if (vm.formErrors()['name']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['name'] }}
                  </span>
                }
              </div>

              <!-- Alter Ego Field -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Alter ego
                </label>
                <input
                  hlmInput
                  type="text"
                  placeholder="Real name or alias"
                  [value]="vm.getFormValue('alias') || ''"
                  (input)="onAliasChange($event)"
                  class="w-full"
                />
                @if (vm.formErrors()['alias']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['alias'] }}
                  </span>
                }
              </div>

              <!-- Power Class Select -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Power class
                </label>
                <select
                  hlmInput
                  [value]="vm.getFormValue('powerClass') || ''"
                  (change)="onPowerClassChange($event)"
                  class="w-full"
                >
                  <option value="Aerial">Aerial</option>
                  <option value="Energy">Energy</option>
                  <option value="Psionic">Psionic</option>
                  <option value="Tech">Tech</option>
                  <option value="Mutant">Mutant</option>
                  <option value="Cosmic">Cosmic</option>
                  <option value="Enhanced">Enhanced</option>
                </select>
                @if (vm.formErrors()['powerClass']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['powerClass'] }}
                  </span>
                }
              </div>

              <!-- Power Index Field -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Power index (0-100)
                </label>
                <input
                  hlmInput
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  [value]="vm.getFormValue('powerIndex') || ''"
                  (input)="onPowerIndexChange($event)"
                  class="w-full"
                />
                @if (vm.formErrors()['powerIndex']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['powerIndex'] }}
                  </span>
                }
              </div>

              <!-- Field Notes Textarea -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Field notes (optional)
                </label>
                <textarea
                  hlmInput
                  placeholder="Initial field observations..."
                  [value]="vm.getFormValue('bio') || ''"
                  (input)="onBioChange($event)"
                  class="w-full min-h-24 resize-vertical"
                ></textarea>
                @if (vm.formErrors()['bio']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['bio'] }}
                  </span>
                }
              </div>

              <!-- Initial Status -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-foreground">
                  Initial status
                </label>
                <select
                  hlmInput
                  [value]="vm.getFormValue('status') || ''"
                  (change)="onStatusChange($event)"
                  class="w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Injured">Injured</option>
                  <option value="Reserve">Reserve</option>
                  <option value="MIA">MIA</option>
                </select>
                @if (vm.formErrors()['status']) {
                  <span class="text-xs text-destructive">
                    {{ vm.formErrors()['status'] }}
                  </span>
                }
              </div>

              <!-- Form Actions -->
              <div class="flex gap-3 pt-6 border-t border-border">
                <button
                  hlmBtn
                  type="submit"
                  variant="default"
                  [disabled]="vm.isSubmitting()"
                  class="flex-1"
                >
                  @if (vm.isSubmitting()) {
                    <span>Recruiting...</span>
                  } @else {
                    <span>Recruit Hero</span>
                  }
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  routerLink="/roster"
                  [disabled]="vm.isSubmitting()"
                  class="flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      textarea {
        font-family: inherit;
      }
    `,
  ],
})
export class Recruit {
  vm = inject(RecruitViewModel);

  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vm.setFormValue('name', target.value);
  }

  onAliasChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vm.setFormValue('alias', target.value);
  }

  onPowerClassChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as any;
    this.vm.setFormValue('powerClass', value);
  }

  onPowerIndexChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    this.vm.setFormValue('powerIndex', value);
  }

  onBioChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.vm.setFormValue('bio', target.value);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as any;
    this.vm.setFormValue('status', value);
  }

  onSubmit(): void {
    this.vm.submitForm();
  }
}

