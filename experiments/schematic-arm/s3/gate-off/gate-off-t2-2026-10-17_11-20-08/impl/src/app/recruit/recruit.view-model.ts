import { inject, Injectable, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { formMeta } from '../forms/zod-meta';
import { CLEARANCE_TIERS, clearanceLabel, POWER_CLASSES, type ClearanceTier, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from './recruit.schema';

// A blank recruit. Not linkedSignal: every visit starts from an empty form.
const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 50,
  notes: '',
  clearanceTier: 1,
};

// The recruit screen's state and logic, no DOM. Component-scoped (no providedIn): the Recruit
// component provides it, so each visit gets a clean form.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly model = signal<RecruitModel>(BLANK_RECRUIT);

  readonly meta = formMeta(recruitSchema);
  readonly powerClasses = POWER_CLASSES;
  readonly clearanceOptions = CLEARANCE_TIERS.map((tier) => ({ value: tier, label: clearanceLabel(tier) }));

  // Submission goes through submission.action, which the FormRoot on the recruit form fires.
  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: { action: () => this.recruit() },
  });

  // The select reports null or undefined when it has no choice; the form keeps its value then.
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, powerClass: value }));
    }
  }

  setClearance(value: ClearanceTier | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, clearanceTier: value }));
    }
  }

  private async recruit(): Promise<void> {
    const hero = this.heroService.recruit(this.model());
    await this.router.navigate(['/detail', hero.id]);
  }
}
