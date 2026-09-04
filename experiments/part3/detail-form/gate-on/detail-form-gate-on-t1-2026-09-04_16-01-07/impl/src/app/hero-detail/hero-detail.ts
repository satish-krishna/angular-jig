import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { z } from 'zod';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HeroService } from '../services/hero.service';

const heroEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type HeroEditForm = z.infer<typeof heroEditSchema>;

@Component({
  selector: 'app-hero-detail',
  imports: [HlmButtonImports, HlmInputImports, HlmCardImports],
  template: `
    <div class="flex flex-col gap-6">
      <h1>Hero Detail</h1>

      @if (hero(); as currentHero) {
        <div class="flex flex-col gap-6">
          <!-- Detail Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ currentHero.name }}</h2>
            </div>
            <div hlmCardContent>
              <p>ID: {{ currentHero.id }}</p>
            </div>
          </div>

          <!-- Edit Form -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Edit Hero</h3>
            </div>

            <form (ngSubmit)="onSave()" class="flex flex-col gap-6">
              <div hlmCardContent class="flex flex-col gap-2">
                <label for="heroName">Hero Name</label>
                <input
                  hlmInput
                  id="heroName"
                  type="text"
                  [value]="formData().name"
                  (change)="onNameChange($event)"
                  placeholder="Enter hero name"
                />
              </div>

              <div hlmCardFooter class="flex gap-3">
                <button hlmBtn type="submit">Save</button>
                <button hlmBtn type="button" variant="outline" (click)="onCancel()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      } @else {
        <div>
          <p>Hero not found</p>
        </div>
      }
    </div>
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private heroService = inject(HeroService);

  hero = signal<{ id: number; name: string } | undefined>(undefined);
  formData = signal<HeroEditForm>({ name: '' });

  constructor() {
    effect(() => {
      const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
      if (id) {
        const loadedHero = this.heroService.getHero(id);
        this.hero.set(loadedHero);
        if (loadedHero) {
          this.formData.set({ name: loadedHero.name });
        }
      }
    });
  }

  onNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.formData.set({ name: value });
  }

  onSave(): void {
    const currentHero = this.hero();
    const data = this.formData();
    const result = heroEditSchema.safeParse(data);
    if (currentHero && result.success) {
      this.heroService.updateHero(currentHero.id, result.data.name);
      this.location.back();
    }
  }

  onCancel(): void {
    this.location.back();
  }
}
