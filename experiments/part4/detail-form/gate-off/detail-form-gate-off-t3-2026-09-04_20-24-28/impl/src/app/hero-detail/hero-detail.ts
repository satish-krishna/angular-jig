import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HeroService, Hero } from '../services/hero.service';
import { heroDetailSchema, type HeroDetailModel } from './hero-detail.schema';

@Component({
  selector: 'app-hero-detail',
  imports: [
    HlmCardImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-8">
      <h1 class="mb-8">Hero Detail</h1>

      @if (hero(); as currentHero) {
        <section hlmCard class="mb-8">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ currentHero.name }}</h2>
            <p hlmCardDescription>ID: {{ currentHero.id }}</p>
          </div>
          <div hlmCardContent>
            <p class="text-muted-foreground">Details for this hero</p>
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Edit Hero</h3>
          </div>
          <div hlmCardContent>
            <form (ngSubmit)="submitForm()" class="flex flex-col gap-4">
              <div hlmField>
                <label hlmLabel for="name">Name</label>
                <input
                  hlmInput
                  type="text"
                  id="name"
                  [value]="model().name"
                  (change)="updateName($event)"
                  placeholder="Enter hero name"
                />
              </div>
              <div class="flex gap-2 pt-4">
                <button hlmBtn type="submit">
                  Save
                </button>
                <button hlmBtn variant="ghost" type="button" (click)="cancel()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      } @else {
        <p class="text-muted-foreground">Hero not found.</p>
      }
    </div>
  `,
})
export class HeroDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private heroService = inject(HeroService);

  hero = signal<Hero | undefined>(undefined);
  protected readonly model = signal<HeroDetailModel>({ name: '' });
  protected readonly heroForm = form(this.model, (path) =>
    validateStandardSchema(path, heroDetailSchema)
  );

  ngOnInit(): void {
    const heroId = toSignal(this.route.paramMap);
    const id = () => Number(heroId()?.get('id'));

    const currentHero = this.heroService.getHeroById(id());
    this.hero.set(currentHero);

    if (currentHero) {
      this.model.set({ name: currentHero.name });
      this.heroForm().reset({ name: currentHero.name });
    }
  }

  updateName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.model.set({ name: target.value });
  }

  submitForm(): void {
    submit(this.heroForm, async () => {
      const currentHero = this.hero();
      if (currentHero && this.model().name) {
        this.heroService.updateHero(currentHero.id, this.model().name);
        this.hero.set({ ...currentHero, name: this.model().name });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/heroes']);
  }
}
