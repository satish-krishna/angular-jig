import { inject, Injectable, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { POWER_CLASSES, type PowerClass } from '../domain/hero';
import { heroFormSchema, type HeroModel } from '../domain/hero-form.schema';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';

const STARTING_POWER_INDEX = 50;

// Recruit state: the intake form and the recruit action. Component-scoped, provided by Recruit.
// The form is built from the same schema as the hero edit form, so the rules and labels match.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly model = signal<HeroModel>({
    name: '',
    alias: '',
    powerClass: POWER_CLASSES[0],
    powerIndex: STARTING_POWER_INDEX,
    notes: '',
  });

  readonly form = form(this.model, (path) => validateStandardSchema(path, heroFormSchema));
  readonly meta = formMeta(heroFormSchema);
  readonly powerClassOptions = this.meta['powerClass']?.options ?? [];

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.form.powerClass().value.set(value);
    }
  }

  // A valid submit adds the recruit to the roster and opens their detail screen.
  save(): void {
    void submit(this.form, async (field) => {
      const hero = this.heroService.recruit(field().value());
      await this.router.navigate(['/detail', hero.id]);
    });
  }

  cancel(): void {
    void this.router.navigate(['/roster']);
  }
}
