import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroService, Hero } from '../services/hero.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-hero-detail',
  imports: [FormsModule, HlmCardImports, HlmInputImports, HlmButtonImports],
  template: `
    <div class="hero-detail-container">
      <h1>Hero Detail</h1>

      @if (hero()) {
        <div hlm-card class="hero-card">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ hero()!.name }}</h2>
          </div>
          <div hlmCardContent>
            <p><strong>ID:</strong> {{ hero()!.id }}</p>
          </div>
        </div>

        <form class="edit-form" (ngSubmit)="onSave()">
          <div class="form-group">
            <label for="heroName">Hero Name</label>
            <input
              id="heroName"
              type="text"
              hlmInput
              [ngModel]="editedName()"
              (ngModelChange)="editedName.set($event)"
              name="heroName"
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" hlmBtn>Save</button>
            <button type="button" hlmBtn (click)="onCancel()">Cancel</button>
          </div>
        </form>
      } @else {
        <p>Hero not found.</p>
      }
    </div>
  `,
  styles: `
    :host {
      --spacing-container: 2rem;
      --spacing-padding: 1rem;
      --spacing-card-gap: 2rem;
      --spacing-form-gap: 1.5rem;
      --spacing-form-group-gap: 0.5rem;
      --spacing-form-actions-gap: 1rem;
      --spacing-button-width: 100px;
    }

    .hero-detail-container {
      max-width: 600px;
      margin: var(--spacing-container) auto;
      padding: 0 var(--spacing-padding);
    }

    .hero-card {
      margin-bottom: var(--spacing-card-gap);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-form-gap);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-form-group-gap);
    }

    .form-group label {
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-form-actions-gap);
      justify-content: flex-start;
    }

    button {
      min-width: var(--spacing-button-width);
    }
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private heroService = inject(HeroService);

  hero = signal<Hero | undefined>(undefined);
  editedName = signal('');

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const loadedHero = this.heroService.getHero(id);
      this.hero.set(loadedHero);
      if (loadedHero) {
        this.editedName.set(loadedHero.name);
      }
    });
  }

  onSave(): void {
    if (this.hero() && this.editedName()) {
      this.heroService.updateHero(this.hero()!.id, this.editedName());
      this.hero.set({ ...this.hero()!, name: this.editedName() });
      this.router.navigate(['/heroes']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
