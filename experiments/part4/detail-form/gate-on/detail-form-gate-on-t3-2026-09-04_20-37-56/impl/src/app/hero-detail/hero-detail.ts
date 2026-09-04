import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HeroesService, Hero } from '../heroes/heroes.service';
import { heroDetailSchema, type HeroDetailModel } from './hero-detail.schema';
import { formMeta } from '../forms/zod-meta';

@Component({
  selector: 'app-hero-detail',
  imports: [
    HlmFieldImports,
    HlmButtonImports,
    HlmInputImports,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmLabelImports,
  ],
  template: `
    <div class="hero-detail-container">
      <h1 class="text-3xl font-bold mb-8">Hero Detail</h1>

      @if (hero(); as heroData) {
        <div class="grid grid-cols-1 gap-8 max-w-2xl">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ heroData.name }}</h2>
            </div>
            <div hlmCardContent>
              <div class="flex flex-col gap-4">
                <div>
                  <span class="font-medium">ID:</span>
                  <span class="ml-2">{{ heroData.id }}</span>
                </div>
                <div>
                  <span class="font-medium">Name:</span>
                  <span class="ml-2">{{ heroData.name }}</span>
                </div>
              </div>
            </div>
          </section>

          <section hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Edit Hero</h3>
            </div>
            <div hlmCardContent>
              <form (ngSubmit)="onSave()" class="flex flex-col gap-4">
                <div hlmField>
                  <label hlmLabel for="heroName">
                    {{ meta['name'].label }}
                  </label>
                  <input
                    id="heroName"
                    type="text"
                    hlmInput
                    [value]="heroForm.name().value()"
                    (input)="updateName($event)"
                    [placeholder]="meta['name'].placeholder || ''"
                  />
                  @for (error of heroForm.name().errors(); track error.kind) {
                    <hlm-field-error>{{ error.message }}</hlm-field-error>
                  }
                </div>

                <div class="flex gap-3 pt-4">
                  <button type="submit" hlmBtn>Save</button>
                  <button type="button" hlmBtn variant="ghost" (click)="onCancel()">Cancel</button>
                </div>
              </form>
            </div>
          </section>
        </div>
      } @else {
        <div class="text-center text-muted-foreground">
          <p>Hero not found</p>
        </div>
      }
    </div>
  `,
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly heroesService = inject(HeroesService);

  hero = signal<Hero | undefined>(undefined);
  protected readonly model = signal<HeroDetailModel>({ name: '' });
  protected readonly heroForm = form(
    this.model,
    (path) => validateStandardSchema(path, heroDetailSchema),
  );
  protected readonly meta = formMeta(heroDetailSchema);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        const heroId = Number(id);
        const heroData = this.heroesService.getHero(heroId);
        if (heroData) {
          this.hero.set(heroData);
          this.model.set({ name: heroData.name });
        }
      }
    });
  }

  updateName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.heroForm.name().value.set(value);
    this.model.update((m) => ({ ...m, name: value }));
  }

  onSave(): void {
    submit(this.heroForm, async () => {
      const heroData = this.hero();
      if (heroData) {
        this.heroesService.updateHero({
          id: heroData.id,
          name: this.model().name,
        });
        await this.router.navigate(['/heroes']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
