import { inject, Injectable, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

function isPowerClass(value: unknown): value is PowerClass {
  return (POWER_CLASSES as readonly unknown[]).includes(value);
}

function isClearanceTier(value: unknown): value is ClearanceTier {
  return (CLEARANCE_TIERS as readonly unknown[]).includes(value);
}

function blankRecruit(): RecruitModel {
  return { name: '', alias: '', powerClass: POWER_CLASSES[0], power: 0, clearance: CLEARANCE_TIERS[0], dossier: '' };
}

// Component-scoped: provided by Recruit, so each visit starts with a blank form.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  /** Field labels, help text, and placeholders come off the schema rather than being restated here. */
  readonly meta = formMeta(recruitSchema);
  readonly powerClasses = POWER_CLASSES;
  readonly clearanceTiers = CLEARANCE_TIERS;

  private readonly model = signal<RecruitModel>(blankRecruit());

  readonly recruitForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  /** Writes the recruit to the shared roster, then opens their new record. */
  readonly save = () =>
    submit(this.recruitForm, async () => {
      const id = this.heroService.recruit(this.model());
      void this.router.navigate(['/detail', id]);
    });

  /** The selects emit untyped, so anything outside the known options is ignored. */
  setPowerClass(value: unknown): void {
    if (isPowerClass(value)) this.model.update((model) => ({ ...model, powerClass: value }));
  }

  setClearance(value: unknown): void {
    if (isClearanceTier(value)) this.model.update((model) => ({ ...model, clearance: value }));
  }
}
