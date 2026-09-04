import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HeroService, type Hero } from '../services/hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmCardImports, HlmInputImports],
  template: `
    <div class="flex flex-col gap-8 p-8">
      <h1 class="text-4xl font-bold">Hero Detail</h1>

      @if (hero(); as currentHero) {
        <div class="flex flex-col gap-8 max-w-2xl">
          <!-- Hero detail card -->
          <div hlmCard>
            <div hlmCardHeader>
              <div hlmCardTitle>{{ currentHero.name }}</div>
            </div>
            <div hlmCardContent>
              <div class="flex flex-col gap-4">
                <div>
                  <span class="text-sm text-muted-foreground">ID</span>
                  <p class="text-lg">{{ currentHero.id }}</p>
                </div>
                <div>
                  <span class="text-sm text-muted-foreground">Name</span>
                  <p class="text-lg">{{ currentHero.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit form card -->
          <div hlmCard>
            <div hlmCardHeader>
              <div hlmCardTitle>Edit Hero</div>
            </div>
            <div hlmCardContent>
              <form
                [formGroup]="form"
                (ngSubmit)="onSave()"
                class="flex flex-col gap-6"
              >
                <div class="flex flex-col gap-2">
                  <label for="name" class="text-sm font-medium">Hero Name</label>
                  <input
                    id="name"
                    type="text"
                    hlmInput
                    formControlName="name"
                    placeholder="Enter hero name"
                  />
                </div>

                <div class="flex gap-3 justify-end">
                  <button hlmBtn variant="outline" type="button" (click)="onCancel()">
                    Cancel
                  </button>
                  <button hlmBtn type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center text-muted-foreground">
          Hero not found
        </div>
      }
    </div>
  `,
})
export class HeroDetail {
  private heroService = inject(HeroService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  hero = signal<Hero | undefined>(undefined);
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const currentHero = this.hero();
      if (currentHero) {
        this.form.patchValue({ name: currentHero.name });
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const heroId = parseInt(id, 10);
        const foundHero = this.heroService.getHero(heroId);
        this.hero.set(foundHero);
      }
    });
  }

  onSave(): void {
    const currentHero = this.hero();
    if (currentHero && this.form.valid) {
      const newName = this.form.get('name')?.value || '';
      this.heroService.updateHero(currentHero.id, newName);
      this.hero.set({ ...currentHero, name: newName });
      this.location.back();
    }
  }

  onCancel(): void {
    this.location.back();
  }
}
