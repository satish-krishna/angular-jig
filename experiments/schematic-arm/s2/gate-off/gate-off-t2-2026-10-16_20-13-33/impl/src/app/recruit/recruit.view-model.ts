import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { formMeta } from '../forms/zod-meta';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/** A blank recruit: the first class and tier, and the middle of the power scale. */
const BLANK: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 50,
  clearance: CLEARANCE_TIERS[0],
};

/**
 * The recruit screen's state: the schema-driven form and the submit that adds the hero to
 * the roster and opens their new record. Component-scoped.
 */
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  /** Field labels and control kinds ride on the schema. */
  readonly labels = formMeta(recruitSchema);
  readonly powerClasses: readonly PowerClass[] = POWER_CLASSES;
  readonly clearanceTiers: readonly ClearanceTier[] = CLEARANCE_TIERS;

  private readonly model = signal<RecruitModel>(BLANK);
  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  readonly save = () =>
    submit(this.form, async () => {
      const hero = this.heroes.recruit(this.model());
      void this.router.navigate(['/detail', hero.id]);
      return undefined;
    });

  /** The selects report a cleared value as null; a cleared choice leaves the current one in place. */
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((current) => ({ ...current, powerClass: value }));
    }
  }

  setClearance(value: ClearanceTier | null | undefined): void {
    if (value) {
      this.model.update((current) => ({ ...current, clearance: value }));
    }
  }
}
