import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { NgIcon } from '@ng-icons/core';
import { HeroEditForm } from '../ui/hero-edit-form';
import { HeroService } from '../domain/hero.service';
import { heroEditSchema, type HeroModel } from '../domain/hero.schema';
import type { Hero } from '../domain/hero.model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-recruit',
  imports: [
    CommonModule,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    NgIcon,
    HeroEditForm,
  ],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideUserPlus,
    }),
  ],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Back Link -->
      <button
        hlmBtn
        variant="ghost"
        (click)="goBack()"
        class="w-fit text-sm text-muted-foreground hover:text-foreground"
      >
        <ng-icon name="lucideChevronLeft" class="mr-1 size-4" />
        Back
      </button>

      <!-- Page Title -->
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ng-icon name="lucideUserPlus" class="size-5" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Recruit Hero</h1>
          <p class="text-sm text-muted-foreground">Add a new hero to the roster</p>
        </div>
      </div>

      <!-- Recruit Form -->
      <div hlmCard class="max-w-2xl">
        <div hlmCardHeader>
          <div hlmCardTitle>Hero Information</div>
        </div>
        <div hlmCardContent class="p-6">
          <app-hero-edit-form
            [data]="formData()"
            [errors]="validationErrors()"
            (fieldChanged)="onFormFieldChange($event)"
            (submitted)="submitRecruit()"
            (canceled)="goBack()"
          />
        </div>
      </div>
    </div>
  `,
})
export class Recruit {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly formData = signal<HeroModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 50,
    status: 'Active',
    notes: '',
  });
  readonly validationErrors = signal<Record<string, string>>({});

  onFormFieldChange(event: { fieldName: string; value: unknown }): void {
    const current = this.formData();
    const updated = { ...current, [event.fieldName]: event.value };
    this.formData.set(updated);
    this.validateField(event.fieldName, event.value);
  }

  private validateField(fieldName: string, value: unknown): void {
    const errors = this.validationErrors();
    const schema = heroEditSchema;
    const field = Object.entries(schema.shape).find(([key]) => key === fieldName);
    if (field) {
      try {
        field[1].parse(value);
        delete errors[fieldName];
      } catch (e) {
        if (e instanceof Error) {
          errors[fieldName] = e.message;
        }
      }
    }
    this.validationErrors.set({ ...errors });
  }

  submitRecruit(): void {
    const data = this.formData();
    const result = heroEditSchema.safeParse(data);
    if (result.success) {
      const newHero: Hero = {
        id: `hero-${Date.now()}`,
        name: result.data.name,
        alias: result.data.alias,
        powerClass: result.data.powerClass,
        powerIndex: result.data.powerIndex,
        status: result.data.status,
        clearanceTier: 'Tier3',
        missionCount: 0,
        successRate: 0,
      };
      this.heroService.addHero(newHero);
      this.router.navigate(['/roster']);
    } else {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      this.validationErrors.set(errors);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
