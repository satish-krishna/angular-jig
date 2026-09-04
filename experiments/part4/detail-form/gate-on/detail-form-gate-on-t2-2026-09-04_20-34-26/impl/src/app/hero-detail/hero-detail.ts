import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { HeroService, Hero } from '../hero.service';
import { heroSchema, HeroModel } from './hero.schema';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardContent, HlmCardHeader, HlmCardTitle, HlmCard } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-hero-detail',
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmFieldImports,
    HlmLabelImports,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Hero Detail</h1>

      @if (currentHero(); as hero) {
        <div class="grid grid-cols-1 gap-8 max-w-2xl">
          <!-- Detail Card -->
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ hero.name }}</h2>
            </div>
            <div hlmCardContent>
              <div class="flex flex-col gap-4">
                <div>
                  <span class="font-medium">ID:</span>
                  <span class="ml-2">{{ hero.id }}</span>
                </div>
                <div>
                  <span class="font-medium">Name:</span>
                  <span class="ml-2">{{ hero.name }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Edit Form -->
          <section hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Edit Hero</h3>
            </div>
            <div hlmCardContent>
              <form (ngSubmit)="onSave()" class="flex flex-col gap-4">
                <div hlmField>
                  <label hlmLabel for="heroName">
                    Hero Name
                  </label>
                  <input
                    id="heroName"
                    type="text"
                    hlmInput
                    [value]="heroForm.name().value()"
                    (input)="updateName($event)"
                    placeholder="Enter hero name"
                  />
                  @for (error of heroForm.name().errors(); track error.kind) {
                    <hlm-field-error>{{ error.message }}</hlm-field-error>
                  }
                </div>

                <div class="flex gap-3 pt-4">
                  <button type="submit" hlmBtn>
                    Save
                  </button>
                  <button type="button" hlmBtn variant="ghost" (click)="onCancel()">
                    Cancel
                  </button>
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
  private readonly heroService = inject(HeroService);

  currentHero = signal<Hero | undefined>(undefined);
  protected readonly model = signal<HeroModel>({ name: '' });
  protected readonly heroForm = form(
    this.model,
    (path) => validateStandardSchema(path, heroSchema),
  );

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        const heroId = parseInt(id, 10);
        const hero = this.heroService.getHeroById(heroId);
        if (hero) {
          this.currentHero.set(hero);
          this.model.set({ name: hero.name });
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
      const hero = this.currentHero();
      if (hero) {
        const updatedHero: Hero = {
          id: hero.id,
          name: this.model().name,
        };
        this.heroService.updateHero(updatedHero);
        this.currentHero.set(updatedHero);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
