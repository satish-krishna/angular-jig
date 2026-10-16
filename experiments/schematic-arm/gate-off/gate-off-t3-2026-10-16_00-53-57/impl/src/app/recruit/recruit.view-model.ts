import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from './recruit.schema';

const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  clearance: 'Tier 1',
  powerIndex: 0,
  notes: '',
};

// Owns the recruit form. A saved recruit is written to the shared roster, then the console opens its record.
// Component-scoped, no DOM.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly model = signal<RecruitModel>(BLANK_RECRUIT);

  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  // Form submit path: the schema gates it, so the action only runs on valid values.
  save(event: Event): void {
    event.preventDefault();
    void submit(this.form, async () => {
      // New recruits start in reserve, with no missions on record.
      const hero = this.heroService.add({
        ...this.model(),
        status: 'Reserve',
        missionCount: 0,
        successRate: 0,
      });
      await this.router.navigate(['/detail', hero.id]);
    });
  }
}
