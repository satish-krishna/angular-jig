import { Component, inject } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold">Recruit New Hero</h1>
        <p class="text-muted-foreground mt-2">Add a new hero to the roster</p>
      </div>

      <!-- Form -->
      <form (ngSubmit)="onSubmit()" class="max-w-2xl">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Name field -->
          <div class="flex flex-col gap-2">
            <label hlmLabel for="name">Name</label>
            <input
              hlmInput
              id="name"
              type="text"
              placeholder="Enter hero name"
              [value]="vm.formName()"
              (input)="vm.setFormName($any($event.target).value)"
              required
            />
          </div>

          <!-- Alias field -->
          <div class="flex flex-col gap-2">
            <label hlmLabel for="alias">Alias</label>
            <input
              hlmInput
              id="alias"
              type="text"
              placeholder="Enter hero alias"
              [value]="vm.formAlias()"
              (input)="vm.setFormAlias($any($event.target).value)"
              required
            />
          </div>

          <!-- Power Class field -->
          <div class="flex flex-col gap-2">
            <label hlmLabel for="powerClass">Power Class</label>
            <hlm-select [value]="vm.formPowerClass()" (change)="vm.setFormPowerClass($any($event))">
              <hlm-select-trigger id="powerClass">
                <hlm-select-value />
              </hlm-select-trigger>
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
          </div>

          <!-- Power Index field -->
          <div class="flex flex-col gap-2">
            <label hlmLabel for="powerIndex">Power Index (0-100)</label>
            <input
              hlmInput
              id="powerIndex"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              [value]="vm.formPowerIndex()"
              (input)="vm.setFormPowerIndex($any($event.target).valueAsNumber)"
              required
            />
          </div>

          <!-- Clearance Tier field -->
          <div class="flex flex-col gap-2">
            <label hlmLabel for="clearanceTier">Clearance Tier</label>
            <hlm-select [value]="vm.formClearanceTier()" (change)="vm.setFormClearanceTier($any($event))">
              <hlm-select-trigger id="clearanceTier">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-select-item value="Tier1">Tier 1</hlm-select-item>
                <hlm-select-item value="Tier2">Tier 2</hlm-select-item>
                <hlm-select-item value="Tier3">Tier 3</hlm-select-item>
                <hlm-select-item value="Tier4">Tier 4</hlm-select-item>
                <hlm-select-item value="Tier5">Tier 5</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
        </div>

        <!-- Notes field (full width) -->
        <div class="flex flex-col gap-2 mt-6">
          <label hlmLabel for="notes">Notes</label>
          <textarea
            hlmTextarea
            id="notes"
            placeholder="Add any notes about this hero"
            [value]="vm.formNotes()"
            (input)="vm.setFormNotes($any($event.target).value)"
            rows="4"
          ></textarea>
        </div>

        <!-- Form actions -->
        <div class="flex gap-2 flex-wrap pt-6">
          <button hlmBtn type="submit" [disabled]="vm.isSaving()">
            @if (vm.isSaving()) {
              <span>Recruiting...</span>
            } @else {
              <span>Add Hero</span>
            }
          </button>
          <button hlmBtn variant="outline" type="button" (click)="vm.cancel()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [
    HlmButton,
    HlmInput,
    HlmSelectImports,
    HlmLabel,
    HlmTextarea,
    HlmSwitchImports,
  ],
  providers: [RecruitViewModel],
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);

  async onSubmit() {
    await this.vm.saveNewHero();
  }
}
