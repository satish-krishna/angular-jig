import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroService, Hero } from '../services/hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [FormsModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Hero Detail</h1>

      @if (hero()) {
        <div class="mb-8 p-6 border border-border rounded-lg bg-card">
          <h2 class="text-2xl font-semibold mb-4">{{ hero()!.name }}</h2>
          <div class="text-sm text-muted-foreground">ID: {{ hero()!.id }}</div>
        </div>

        <div class="p-6 border border-border rounded-lg bg-card">
          <h3 class="text-xl font-semibold mb-6">Edit Hero</h3>
          <form (ngSubmit)="onSave()" class="space-y-6">
            <div>
              <label for="heroName" class="block text-sm font-medium mb-2">
                Hero Name
              </label>
              <input
                hlmInput
                id="heroName"
                type="text"
                [(ngModel)]="editName"
                name="heroName"
                class="w-full"
                placeholder="Enter hero name"
              />
            </div>

            <div class="flex gap-3 justify-end">
              <button
                hlmBtn
                type="button"
                (click)="onCancel()"
                variant="outline"
              >
                Cancel
              </button>
              <button
                hlmBtn
                type="submit"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      } @else {
        <div class="p-6 border border-border rounded-lg bg-card">
          <p class="text-muted-foreground">Hero not found.</p>
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
  editName = signal('');

  constructor() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    if (id) {
      const foundHero = this.heroService.getHeroById(id);
      this.hero.set(foundHero);
      if (foundHero) {
        this.editName.set(foundHero.name);
      }
    }
  }

  onSave(): void {
    const currentHero = this.hero();
    if (currentHero && this.editName()) {
      this.heroService.updateHero(currentHero.id, { name: this.editName() });
      this.hero.set({ ...currentHero, name: this.editName() });
    }
  }

  onCancel(): void {
    this.location.back();
  }
}
