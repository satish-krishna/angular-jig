import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroService, Hero } from '../heroes/hero.service';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-hero-detail',
  imports: [FormsModule, HlmInputImports, HlmButtonImports],
  template: `
    <div class="hero-detail-container">
      <h1>Hero Detail</h1>

      @if (hero(); as currentHero) {
        <div class="detail-card">
          <h2>{{ currentHero.name }}</h2>
          <p><strong>ID:</strong> {{ currentHero.id }}</p>
        </div>

        <div class="edit-form">
          <h3>Edit Hero</h3>
          <div class="form-group">
            <label for="heroName">Hero Name:</label>
            <input
              hlmInput
              id="heroName"
              type="text"
              [(ngModel)]="editName"
              placeholder="Enter hero name"
            />
          </div>
          <div class="form-actions">
            <button hlmBtn (click)="save()">Save</button>
            <button hlmBtn (click)="cancel()">Cancel</button>
          </div>
        </div>
      } @else {
        <p>Hero not found</p>
      }
    </div>
  `,
  styles: `
    .hero-detail-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-lg, 2rem);
      padding: var(--spacing-lg, 2rem);
      max-width: 600px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 var(--spacing-md, 1.5rem) 0;
    }

    .detail-card {
      display: grid;
      gap: var(--spacing-md, 1.5rem);
      padding: var(--spacing-md, 1.5rem);
    }

    .detail-card h2 {
      margin: 0;
    }

    .detail-card p {
      margin: 0;
    }

    .edit-form {
      display: grid;
      gap: var(--spacing-md, 1.5rem);
      padding: var(--spacing-md, 1.5rem);
    }

    .edit-form h3 {
      margin: 0;
    }

    .form-group {
      display: grid;
      gap: var(--spacing-sm, 0.75rem);
    }

    label {
      display: block;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md, 1.5rem);
      justify-content: flex-start;
    }
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private heroService = inject(HeroService);

  hero = signal<Hero | undefined>(undefined);
  editName = '';

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      const currentHero = this.heroService.getHero(id);
      this.hero.set(currentHero);
      if (currentHero) {
        this.editName = currentHero.name;
      }
    });
  }

  save(): void {
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

  cancel(): void {
    this.router.navigate(['/heroes']);
  }
}
