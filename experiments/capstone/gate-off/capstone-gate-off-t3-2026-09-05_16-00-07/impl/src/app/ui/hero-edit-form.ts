import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmButton } from '@spartan-ng/helm/button';
import type { HeroModel } from '../domain/hero.schema';

@Component({
  selector: 'app-hero-edit-form',
  imports: [
    CommonModule,
    HlmInput,
    HlmLabel,
    HlmButton,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Name -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          hlmInput
          type="text"
          [value]="data().name || ''"
          placeholder="Hero name"
          (input)="onFieldChange('name', $event)"
          [class.border-destructive]="errors()['name']"
          class="bg-card text-foreground placeholder-muted-foreground"
        />
        @if (errors()['name']) {
          <span class="text-xs text-destructive">{{ errors()['name'] }}</span>
        }
      </div>

      <!-- Alias -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Alias
        </label>
        <input
          hlmInput
          type="text"
          [value]="data().alias || ''"
          placeholder="Public alias"
          (input)="onFieldChange('alias', $event)"
          [class.border-destructive]="errors()['alias']"
          class="bg-card text-foreground placeholder-muted-foreground"
        />
        @if (errors()['alias']) {
          <span class="text-xs text-destructive">{{ errors()['alias'] }}</span>
        }
      </div>

      <!-- Power Class -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Power Class
        </label>
        <select
          [value]="data().powerClass || ''"
          (change)="onFieldChange('powerClass', $event)"
          [class.border-destructive]="errors()['powerClass']"
          class="rounded-md border border-border bg-card px-3 py-2 text-foreground"
        >
          <option value="">Select a power class</option>
          <option value="Aerial">Aerial</option>
          <option value="Energy">Energy</option>
          <option value="Psionic">Psionic</option>
          <option value="Tech">Tech</option>
          <option value="Mutant">Mutant</option>
          <option value="Cosmic">Cosmic</option>
          <option value="Enhanced">Enhanced</option>
        </select>
        @if (errors()['powerClass']) {
          <span class="text-xs text-destructive">{{ errors()['powerClass'] }}</span>
        }
      </div>

      <!-- Power Index -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Power Index
        </label>
        <input
          hlmInput
          type="number"
          [value]="data().powerIndex || 0"
          placeholder="0-100"
          (input)="onFieldChange('powerIndex', $event)"
          [class.border-destructive]="errors()['powerIndex']"
          class="bg-card text-foreground placeholder-muted-foreground"
        />
        @if (errors()['powerIndex']) {
          <span class="text-xs text-destructive">{{ errors()['powerIndex'] }}</span>
        }
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Status
        </label>
        <select
          [value]="data().status || ''"
          (change)="onFieldChange('status', $event)"
          [class.border-destructive]="errors()['status']"
          class="rounded-md border border-border bg-card px-3 py-2 text-foreground"
        >
          <option value="">Select a status</option>
          <option value="Active">Active</option>
          <option value="Injured">Injured</option>
          <option value="Reserve">Reserve</option>
          <option value="MIA">MIA</option>
        </select>
        @if (errors()['status']) {
          <span class="text-xs text-destructive">{{ errors()['status'] }}</span>
        }
      </div>

      <!-- Notes -->
      <div class="flex flex-col gap-2">
        <label hlmLabel class="text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          hlmInput
          [value]="data().notes || ''"
          placeholder="Additional notes"
          (input)="onFieldChange('notes', $event)"
          [class.border-destructive]="errors()['notes']"
          class="bg-card text-foreground placeholder-muted-foreground min-h-24 resize-none"
        ></textarea>
        @if (errors()['notes']) {
          <span class="text-xs text-destructive">{{ errors()['notes'] }}</span>
        }
      </div>

      <div class="flex gap-3 pt-4">
        <button hlmBtn variant="default" (click)="onSubmit()">
          Save
        </button>
        <button hlmBtn variant="outline" (click)="onCancel()">
          Cancel
        </button>
      </div>
    </div>
  `,
})
export class HeroEditForm {
  data = input.required<HeroModel>();
  errors = input<Record<string, string>>({});
  fieldChanged = output<{ fieldName: string; value: unknown }>();
  submitted = output<void>();
  canceled = output<void>();

  onFieldChange(fieldName: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    let value: unknown = target.value;
    if (target.type === 'number') {
      value = parseInt(target.value, 10);
    }
    this.fieldChanged.emit({ fieldName, value });
  }

  onSubmit(): void {
    this.submitted.emit();
  }

  onCancel(): void {
    this.canceled.emit();
  }
}
