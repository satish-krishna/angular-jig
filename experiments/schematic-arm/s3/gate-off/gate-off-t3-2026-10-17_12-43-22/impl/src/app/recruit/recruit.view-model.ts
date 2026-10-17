import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CLEARANCE_TIERS, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { CLEARANCE_OPTIONS, recruitSchema, type RecruitModel } from './recruit.schema';

function blankRecruit(): RecruitModel {
  return {
    name: '',
    alias: '',
    powerClass: POWER_CLASSES[0],
    powerIndex: 50,
    clearanceTier: CLEARANCE_TIERS[0],
    notes: '',
  };
}

// The selects hand their values back as unknown, so narrow them before they reach the form.
function isPowerClass(value: unknown): value is PowerClass {
  return POWER_CLASSES.some((powerClass) => powerClass === value);
}

function isClearanceTier(value: unknown): value is ClearanceTier {
  return CLEARANCE_TIERS.some((tier) => tier === value);
}

// Component-scoped: the recruit screen provides it, so each visit starts with a blank form.
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  public readonly fields = formMeta(recruitSchema);

  public readonly classOptions = POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass }));

  public readonly clearanceOptions = CLEARANCE_OPTIONS;

  private readonly model = signal<RecruitModel>(blankRecruit());

  public readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  public setPowerClass(value: unknown): void {
    if (isPowerClass(value)) {
      this.form.powerClass().value.set(value);
    }
  }

  public setClearance(value: unknown): void {
    if (isClearanceTier(value)) {
      this.form.clearanceTier().value.set(value);
    }
  }

  // A recruit joins the roster in reserve, and the console opens their new record.
  public save(): void {
    void submit(this.form, async () => {
      const { name, alias, powerClass, powerIndex, clearanceTier, notes } = this.model();
      const hero = this.heroes.add({
        name: name.trim(),
        alias: alias.trim(),
        powerClass,
        powerIndex,
        clearanceTier,
        notes: notes.trim(),
      });
      void this.router.navigate(['/detail', hero.id]);
      return undefined;
    });
  }

  public discard(): void {
    this.model.set(blankRecruit());
  }
}
