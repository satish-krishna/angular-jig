import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeroService, Hero } from '../services/hero.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule, ReactiveFormsModule, HlmButtonImports, HlmInputImports, HlmCardImports],
  template: `
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-2xl mx-auto flex flex-col gap-8">
        <button hlmBtn variant="ghost" (click)="goBack()">
          ← Back
        </button>

        <h1 class="text-4xl font-bold">Hero Detail</h1>

        @if (hero(); as currentHero) {
          <div hlmCard class="flex flex-col gap-4">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ currentHero.name }}</h2>
              <div hlmCardDescription>ID: {{ currentHero.id }}</div>
            </div>
          </div>

          <div hlmCard class="flex flex-col gap-6">
            <div hlmCardHeader>
              <h3 hlmCardTitle>Edit Hero</h3>
            </div>

            <form (ngSubmit)="onSave()" class="flex flex-col gap-6">
              <div hlmCardContent class="flex flex-col gap-2">
                <label for="heroName" class="text-sm font-medium">
                  Hero Name
                </label>
                <input
                  id="heroName"
                  type="text"
                  hlmInput
                  [formControl]="nameControl"
                  placeholder="Enter hero name"
                />
              </div>

              <div hlmCardFooter class="flex gap-4">
                <button hlmBtn type="submit">
                  Save
                </button>
                <button hlmBtn type="button" variant="outline" (click)="onCancel()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        } @else {
          <div class="text-center p-8">
            Hero not found
          </div>
        }
      </div>
    </div>
  `,
})
export class HeroDetail {
  hero = signal<Hero | undefined>(undefined);
  nameControl = new FormControl('', { nonNullable: true });

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location
  ) {
    effect(() => {
      const params = this.route.snapshot.params;
      const id = parseInt(params['id'], 10);

      if (id) {
        const loadedHero = this.heroService.getHero(id);
        this.hero.set(loadedHero);

        if (loadedHero) {
          this.nameControl.setValue(loadedHero.name);
        }
      }
    });
  }

  onSave(): void {
    if (this.hero() && this.nameControl.valid) {
      const heroId = this.hero()!.id;
      const newName = this.nameControl.value;
      this.heroService.updateHero(heroId, newName);
      this.hero.update((h) => (h ? { ...h, name: newName } : h));
      this.location.back();
    }
  }

  onCancel(): void {
    this.location.back();
  }

  goBack(): void {
    this.location.back();
  }
}
