import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroService, Hero } from '../hero.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-hero-detail',
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
  ],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Hero Detail</h1>

      @if (hero(); as currentHero) {
        <div class="mb-8">
          <div hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ currentHero.name }}</h2>
            </div>
            <div hlmCardContent>
              <p>ID: {{ currentHero.id }}</p>
            </div>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Edit Hero</h3>
          </div>
          <div hlmCardContent>
            <form (ngSubmit)="onSave()" class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <label for="heroName" class="block text-sm font-medium">Hero Name</label>
                <input
                  hlmInput
                  id="heroName"
                  type="text"
                  [(ngModel)]="editName"
                  name="heroName"
                  placeholder="Enter hero name"
                />
              </div>

              <div class="flex gap-4">
                <button hlmBtn type="submit">
                  Save
                </button>
                <button hlmBtn type="button" (click)="onCancel()" variant="secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-muted-foreground">Hero not found</p>
        </div>
      }
    </div>
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private heroService = inject(HeroService);

  hero = signal<Hero | undefined>(undefined);
  editName = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      const currentHero = this.heroService.getHero(id);
      this.hero.set(currentHero);
      if (currentHero) {
        this.editName = currentHero.name;
      }
    });
  }

  onSave(): void {
    const currentHero = this.hero();
    if (currentHero && this.editName.trim()) {
      this.heroService.updateHero({
        ...currentHero,
        name: this.editName.trim(),
      });
      this.hero.set({
        ...currentHero,
        name: this.editName.trim(),
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
