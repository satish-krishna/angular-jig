import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HlmButton } from '../../../libs/ui/button/src';
import { HlmInput } from '../../../libs/ui/input/src';
import { HlmCard } from '../../../libs/ui/card/src';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [ReactiveFormsModule, HlmButton, HlmInput, HlmCard],
  template: `
    <div class="container">
      <h1>Hero Detail</h1>

      @if (hero(); as loadedHero) {
        <div hlmCard class="detail-card">
          <h2 class="card-title">{{ loadedHero.name }}</h2>
          <p class="card-info"><strong>ID:</strong> {{ loadedHero.id }}</p>
        </div>

        <div class="edit-section">
          <h3>Edit Hero</h3>
          <form [formGroup]="editForm" class="edit-form">
            <div class="form-group">
              <label for="heroName">Name</label>
              <input
                id="heroName"
                type="text"
                hlmInput
                formControlName="name"
              />
            </div>

            <div class="button-group">
              <button
                type="button"
                hlmBtn
                (click)="onSave()"
                variant="default"
              >
                Save
              </button>
              <button
                type="button"
                hlmBtn
                (click)="onCancel()"
                variant="outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      } @else {
        <p>Hero not found.</p>
      }
    </div>
  `,
  styles: `
    .container {
      padding: var(--spacing-5);
      max-width: 52rem;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: var(--spacing-5);
    }

    .detail-card {
      margin-bottom: var(--spacing-6);
    }

    .card-title {
      margin: 0 0 var(--spacing-3) 0;
      font-size: 1.25rem;
    }

    .card-info {
      margin: 0;
      color: var(--text-secondary);
    }

    .edit-section {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-4);
      background-color: var(--bg-secondary);
    }

    .edit-section h3 {
      margin-top: 0;
      margin-bottom: var(--spacing-4);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    label {
      font-weight: 500;
      color: var(--text-primary);
    }

    .button-group {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
    }
  `,
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private heroService = inject(HeroService);
  private location = inject(Location);

  private heroId = signal<number | null>(null);

  hero = computed(() => {
    const id = this.heroId();
    return id ? this.heroService.getHero(id) : null;
  });

  editForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.heroId.set(parseInt(id, 10));
      const heroData = this.hero();
      if (heroData) {
        this.editForm.patchValue({ name: heroData.name });
      }
    }
  }

  onSave() {
    if (this.editForm.valid && this.heroId()) {
      const nameControl = this.editForm.get('name');
      if (nameControl && nameControl.value) {
        this.heroService.updateHero(this.heroId()!, nameControl.value);
      }
    }
  }

  onCancel() {
    this.location.back();
  }
}
