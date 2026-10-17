import { inject, Injectable, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { formMeta } from '../forms/zod-meta';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from './recruit.schema';

const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  clearance: CLEARANCE_TIERS[0],
  notes: '',
};

@Injectable() // no providedIn: scoped to the Recruit component that provides it
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  // Field labels, control kinds and select options come off the zod schema.
  readonly meta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>(BLANK_RECRUIT);

  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  setPowerClass(value: string | null | undefined): void {
    const powerClass = POWER_CLASSES.find((option) => option === value);
    if (powerClass) this.form.powerClass().value.set(powerClass);
  }

  setClearance(value: string | null | undefined): void {
    const clearance = CLEARANCE_TIERS.find((option) => option === value);
    if (clearance) this.form.clearance().value.set(clearance);
  }

  /** Adds the recruit to the roster and opens their new record. */
  save(event: Event): void {
    event.preventDefault();
    void submit(this.form, async () => {
      const hero = this.heroService.add(recruitSchema.parse(this.model()));
      void this.router.navigate(['/detail', hero.id]);
    });
  }

  cancel(): void {
    void this.router.navigate(['/roster']);
  }
}
