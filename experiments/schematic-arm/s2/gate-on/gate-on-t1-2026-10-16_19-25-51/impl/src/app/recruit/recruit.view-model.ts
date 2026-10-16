import { inject, Injectable, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/** The form's starting values. A neutral power index so the field is not left at an extreme. */
const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 50,
  clearance: CLEARANCE_TIERS[0],
};

/** Writes a validated recruit to the shared roster, then opens that hero's detail. */
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  /** Labels, control kinds and options for the form, read off the schema. */
  readonly meta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>({ ...BLANK_RECRUIT });

  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: {
      action: async (field) => {
        const hero = this.heroes.create(field().value());
        void this.router.navigateByUrl(`/detail/${hero.id}`);
        return undefined;
      },
    },
  });

  /** Accepts the select's emitted value and keeps it only if it is a known power class. */
  setPowerClass(value: unknown): void {
    const next = POWER_CLASSES.find((powerClass: PowerClass) => powerClass === value);
    if (next !== undefined) {
      this.heroForm.powerClass().value.set(next);
    }
  }

  /** Accepts the select's emitted value and keeps it only if it is a known clearance tier. */
  setClearance(value: unknown): void {
    const next = CLEARANCE_TIERS.find((tier: ClearanceTier) => tier === value);
    if (next !== undefined) {
      this.heroForm.clearance().value.set(next);
    }
  }
}
