import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { BLANK_HERO, withChoice, type ChoiceField } from '../domain/hero-display';

// The recruit screen's form state and its one write: create the record, then open it. Component-scoped, no DOM.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly model = signal<HeroModel>(BLANK_HERO);
  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  setChoice(field: ChoiceField, value: unknown): void {
    this.model.update((model) => withChoice(model, field, value));
  }

  // The switch reads as "on active duty": on maps to Active, off to Reserve.
  setActive(active: boolean): void {
    this.model.update((model) => ({ ...model, status: active ? 'Active' : 'Reserve' }));
  }

  save(): Promise<boolean> {
    return submit(this.heroForm, async () => {
      const hero = this.heroService.create(this.model());
      await this.router.navigate(['/detail', hero.id]);
    });
  }
}
