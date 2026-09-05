import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideUserPlus,
  lucideChevronLeft,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HeroService } from '../domain/hero.service';
import { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-recruit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmCardImports,
    HlmSelectImports,
    HlmSwitchImports,
  ],
  providers: [
    provideIcons({
      lucideUserPlus,
      lucideChevronLeft,
    }),
  ],
  template: `
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Back Link -->
      <a
        routerLink="/roster"
        class="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <ng-icon name="lucideChevronLeft" class="h-4 w-4"></ng-icon>
        <span>Back to roster</span>
      </a>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground">Recruit New Hero</h1>
        <p class="text-muted-foreground">Add a new agent to the Hero Ops roster</p>
      </div>

      <!-- Recruitment Form -->
      <div hlmCard class="max-w-2xl p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Name -->
          <div class="space-y-2">
            <label hlmLabel for="name" class="text-sm font-medium">
              Name
            </label>
            <input
              hlmInput
              id="name"
              type="text"
              placeholder="Hero name"
              [(ngModel)]="formData.name"
              name="name"
              required
            />
          </div>

          <!-- Alias -->
          <div class="space-y-2">
            <label hlmLabel for="alias" class="text-sm font-medium">
              Alias
            </label>
            <input
              hlmInput
              id="alias"
              type="text"
              placeholder="Operating alias"
              [(ngModel)]="formData.alias"
              name="alias"
              required
            />
          </div>

          <!-- Power Class -->
          <div class="space-y-2">
            <label hlmLabel for="powerClass" class="text-sm font-medium">
              Power Class
            </label>
            <select
              hlmInput
              id="powerClass"
              [(ngModel)]="formData.powerClass"
              name="powerClass"
              required
            >
              <option value="">Select a class</option>
              <option value="Aerial">Aerial</option>
              <option value="Energy">Energy</option>
              <option value="Psionic">Psionic</option>
              <option value="Tech">Tech</option>
              <option value="Mutant">Mutant</option>
              <option value="Cosmic">Cosmic</option>
              <option value="Enhanced">Enhanced</option>
            </select>
          </div>

          <!-- Power Index -->
          <div class="space-y-2">
            <label hlmLabel for="powerIndex" class="text-sm font-medium">
              Power Index (0-100)
            </label>
            <input
              hlmInput
              id="powerIndex"
              type="number"
              min="0"
              max="100"
              placeholder="75"
              [(ngModel)]="formData.powerIndex"
              name="powerIndex"
              required
            />
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label hlmLabel for="notes" class="text-sm font-medium">
              Notes
            </label>
            <textarea
              hlmInput
              id="notes"
              placeholder="Additional information about this hero..."
              [(ngModel)]="formData.notes"
              name="notes"
              rows="4"
            ></textarea>
          </div>

          <!-- Active Status -->
          <div class="flex items-center gap-4">
            <label hlmLabel for="active" class="text-sm font-medium">
              Set as Active
            </label>
            <input
              hlmSwitch
              id="active"
              [(ngModel)]="formData.active"
              name="active"
            />
          </div>

          <!-- Form Actions -->
          <div class="flex gap-3 pt-6">
            <button
              hlmBtn
              type="submit"
              variant="default"
              class="flex-1 gap-2"
            >
              <ng-icon name="lucideUserPlus" class="h-4 w-4"></ng-icon>
              <span>Recruit Hero</span>
            </button>
            <button
              hlmBtn
              type="button"
              variant="outline"
              routerLink="/roster"
              class="flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class Recruit {
  private heroService = inject(HeroService);
  private router = inject(Router);

  formData = {
    name: '',
    alias: '',
    powerClass: '',
    powerIndex: 75,
    notes: '',
    active: true,
  };

  onSubmit(): void {
    if (!this.formData.name || !this.formData.alias || !this.formData.powerClass) {
      alert('Please fill in all required fields');
      return;
    }

    const newHero: Hero = {
      id: String(Date.now()),
      name: this.formData.name,
      alias: this.formData.alias,
      powerClass: this.formData.powerClass as any,
      powerIndex: this.formData.powerIndex,
      status: this.formData.active ? 'Active' : 'Reserve',
      clearanceTier: 'Tier3',
      missionCount: 0,
      successRate: 100,
    };

    this.heroService.addHero(newHero);
    this.router.navigate(['/roster']);
  }
}
