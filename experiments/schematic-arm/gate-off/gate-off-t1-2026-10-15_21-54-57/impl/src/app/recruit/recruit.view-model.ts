import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

const EMPTY_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  clearance: 1,
  notes: '',
};

function isPowerClass(value: string | null | undefined): value is PowerClass {
  return (POWER_CLASSES as readonly string[]).includes(value ?? '');
}

/** Narrows a clearance value to a tier. The schema already limits it to 1-5; this gives the type. */
function clearanceTier(value: number): ClearanceTier {
  return CLEARANCE_TIERS.find((tier) => tier === value) ?? 1;
}

// Owns the recruit form and its submit. Component-scoped (provided by Recruit), so no providedIn.
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  readonly labels = formMeta(recruitSchema);
  readonly powerClasses = POWER_CLASSES;

  private readonly model = signal<RecruitModel>(EMPTY_RECRUIT);

  readonly recruitForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  setPowerClass(value: string | null | undefined): void {
    if (isPowerClass(value)) {
      this.recruitForm.powerClass().value.set(value);
    }
  }

  /** Submit handler. Prevents the native submit, then files the recruit through the schema-validated form. */
  save(event: Event): void {
    event.preventDefault();
    void submit(this.recruitForm, async () => {
      const model = this.model();
      const hero = this.heroes.add({
        name: model.name.trim(),
        alias: model.alias.trim(),
        powerClass: model.powerClass,
        powerIndex: model.powerIndex,
        clearance: clearanceTier(model.clearance),
        notes: model.notes,
      });
      await this.router.navigate(['detail', hero.id]);
    });
  }
}
