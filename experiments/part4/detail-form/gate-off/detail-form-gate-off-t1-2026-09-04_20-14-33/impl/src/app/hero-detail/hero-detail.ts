import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { HeroesService, Hero } from '../heroes/heroes.service';
import { heroDetailSchema, HeroDetailModel } from './hero-detail.schema';
import { formMeta } from '../forms/zod-meta';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCard, HlmCardHeader } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldError } from '@spartan-ng/helm/field';

@Component({
  selector: 'app-hero-detail',
  imports: [
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardHeader,
    HlmField,
    HlmFieldError,
  ],
  template: `
    <div class="grid gap-8 p-6">
      <h1 class="text-3xl font-bold">Hero Detail</h1>

      @if (hero(); as heroData) {
        <div hlmCard>
          <div hlmCardHeader>
            <h2 class="text-xl font-semibold">{{ heroData.name }}</h2>
            <p class="text-sm text-muted-foreground">ID: {{ heroData.id }}</p>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h3 class="text-lg font-semibold">Edit Hero</h3>
          </div>

          <form (ngSubmit)="onSave()" class="grid gap-6 p-6">
            <div hlmField>
              <label hlmLabel for="heroName">{{ meta['name']?.label }}</label>
              <input
                hlmInput
                id="heroName"
                type="text"
                [value]="model().name"
                (input)="onNameChange($event)"
              />
              @for (e of form.name().errors(); track e.kind) {
                <hlm-field-error>{{ e.message }}</hlm-field-error>
              }
            </div>

            <div class="flex gap-3">
              <button hlmBtn type="submit" variant="default">Save</button>
              <button hlmBtn type="button" variant="outline" (click)="onCancel()">
                Cancel
              </button>
            </div>
          </form>
        </div>
      } @else {
        <p class="text-muted-foreground">Hero not found</p>
      }
    </div>
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private heroesService = inject(HeroesService);
  private location = inject(Location);

  hero = signal<Hero | undefined>(undefined);

  protected readonly meta = formMeta(heroDetailSchema);
  protected readonly model = signal<HeroDetailModel>({ name: '' });
  protected readonly form = form(
    this.model,
    (path) => validateStandardSchema(path, heroDetailSchema)
  );

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const heroId = parseInt(id, 10);
      const heroData = this.heroesService.getHeroById(heroId);
      this.hero.set(heroData);
      if (heroData) {
        this.model.set({ name: heroData.name });
      }
    }
  }

  onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model.set({ name: input.value });
  }

  onSave(): void {
    const heroData = this.hero();
    if (heroData && this.model().name) {
      this.heroesService.updateHero(heroData.id, this.model().name);
      this.hero.set({ ...heroData, name: this.model().name });
    }
  }

  onCancel(): void {
    this.location.back();
  }
}

