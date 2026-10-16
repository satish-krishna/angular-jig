import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
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

/**
 * Recruit state: the blank intake form, its validation through the schema, and the
 * submit that adds the new hero to the roster and opens their dossier.
 */
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  /** Labels, options and help text come off the schema, so the template restates none of them. */
  readonly meta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 0,
    clearanceTier: 1,
    notes: '',
  });
  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  /** The clearance select works in strings; the model holds the tier as a number. */
  readonly clearanceOption = computed(() => String(this.form.clearanceTier().value()));

  setPowerClass(value: unknown): void {
    if (isPowerClass(value)) this.form.powerClass().value.set(value);
  }

  setClearanceTier(value: unknown): void {
    const tier = Number(value);
    if (isClearanceTier(tier)) this.form.clearanceTier().value.set(tier);
  }

  /** Validate, add the recruit to the roster, and open their new dossier. */
  save(): Promise<boolean> {
    return submit(this.form, async () => {
      const hero = this.heroes.recruit(recruitSchema.parse(this.model()));
      void this.router.navigate(['/detail', hero.id]);
    });
  }

  cancel(): void {
    void this.router.navigate(['/roster']);
  }
}
