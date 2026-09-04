import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HeroService, Hero } from '../services/hero.service';
import { heroSchema, type HeroModel } from './hero.schema';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-hero-detail',
  imports: [HlmCardImports, HlmFieldImports, HlmInputImports, HlmButtonImports],
  template: `
    <div class="mx-auto max-w-[600px] px-4 py-8">
      <h1 class="mb-8 text-3xl font-bold">Hero Detail</h1>

      @if (hero(); as heroData) {
        <section hlmCard class="mb-8">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ heroData.name }}</h2>
            <p hlmCardDescription>ID: {{ heroData.id }}</p>
          </div>
        </section>

        <section hlmCard>
          <div class="p-6 flex flex-col gap-6">
            <form (ngSubmit)="onSaveForm()">
              <hlm-field>
                <label hlmLabel for="heroName">Hero Name</label>
                <div hlmFieldContent>
                  <input hlmInput id="heroName" type="text" [formField]="heroForm.name()" />
                  @for (error of heroForm.name().errors(); track error.kind) {
                    <hlm-field-error>{{ error.message }}</hlm-field-error>
                  }
                </div>
              </hlm-field>

              <div class="mt-6 flex gap-4">
                <button hlmBtn type="submit">
                  Save
                </button>
                <button hlmBtn variant="outline" type="button" (click)="onCancel()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      } @else {
        <p class="text-muted-foreground">Hero not found</p>
      }
    </div>
  `,
})
export class HeroDetail {
  private heroService = inject(HeroService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private routeParams = toSignal(this.route.params);
  protected readonly hero = signal<Hero | undefined>(undefined);
  protected readonly model = signal<HeroModel>({ name: '' });
  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  constructor() {
    effect(() => {
      const params = this.routeParams();
      if (params?.['id']) {
        const id = parseInt(params['id'], 10);
        const heroData = this.heroService.getHero(id);
        this.hero.set(heroData);
        if (heroData) {
          this.model.set({ name: heroData.name });
        }
      }
    });
  }

  onSaveForm(): void {
    submit(this.heroForm, async () => {
      const heroData = this.hero();
      if (heroData) {
        this.heroService.updateHero(heroData.id, this.model().name);
        this.location.back();
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }
}

