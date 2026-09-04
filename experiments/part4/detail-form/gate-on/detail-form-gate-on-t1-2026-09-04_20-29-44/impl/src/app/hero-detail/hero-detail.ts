import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { HeroService, Hero } from '../services/hero.service';
import { heroSchema, type HeroModel } from './hero.schema';
import { formMeta } from '../forms/zod-meta';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [CommonModule, HlmButton, HlmInput, HlmCardImports],
  template: `
    <div class="grid gap-6 p-6">
      <h1 class="text-3xl font-bold">Hero Detail</h1>

      @if (hero(); as heroData) {
        <div class="grid gap-6 max-w-2xl">
          <!-- Detail Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ heroData.name }}</h2>
            </div>
            <div hlmCardContent>
              <div class="grid gap-2 text-sm">
                <p><strong>ID:</strong> {{ heroData.id }}</p>
                <p><strong>Name:</strong> {{ heroData.name }}</p>
              </div>
            </div>
          </div>

          <!-- Edit Form -->
          <div hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>Edit Hero</h2>
            </div>
            <div hlmCardContent>
              <div class="grid gap-4">
                <div class="grid gap-2">
                  <label for="name" class="text-sm font-medium">
                    {{ meta['name'].label }}
                  </label>
                  <input
                    id="name"
                    type="text"
                    hlmInput
                    [value]="model().name"
                    (input)="model.update(m => ({...m, name: $any($event.target).value}))"
                    [placeholder]="meta['name'].placeholder || 'Enter hero name'"
                  />
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    hlmBtn
                    variant="default"
                    (click)="onSave()"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    hlmBtn
                    variant="outline"
                    (click)="onCancel()"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="p-4 rounded-md bg-destructive/10 text-destructive">
          Hero not found.
        </div>
      }
    </div>
  `,
})
export class HeroDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly heroService = inject(HeroService);

  protected readonly hero = signal<Hero | undefined>(undefined);
  protected readonly model = signal<HeroModel>({ name: '' });
  protected readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema));
  protected readonly meta = formMeta(heroSchema);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const heroId = parseInt(id, 10);
      const foundHero = this.heroService.getHero(heroId);
      if (foundHero) {
        this.hero.set(foundHero);
        this.model.set({ name: foundHero.name });
      }
    }
  }

  onSave(): void {
    const heroData = this.hero();
    if (heroData) {
      this.heroService.updateHero(heroData.id, this.model().name);
      this.router.navigate(['/heroes']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
