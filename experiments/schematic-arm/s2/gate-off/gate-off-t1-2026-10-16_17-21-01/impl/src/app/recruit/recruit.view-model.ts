import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { isClearanceTier, POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  clearanceTier: 1,
};

// Component-scoped (the Recruit component provides it). Owns the recruit draft and
// the act of adding it to the shared roster, then opens the new hero's dossier.
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  // Labels, help text and control kinds ride on the schema; the template reads them here.
  readonly meta = formMeta(recruitSchema);

  readonly classOptions: readonly { readonly value: PowerClass; readonly label: string }[] =
    POWER_CLASSES.map((value) => ({ value, label: value }));

  private readonly model = signal<RecruitModel>({ ...BLANK_RECRUIT });

  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.form.powerClass().value.set(value);
    }
  }

  save(): void {
    void submit(this.form, async () => {
      const { clearanceTier, ...draft } = this.model();
      // The schema already limits the tier to 1-5, so this guard only narrows the type.
      if (!isClearanceTier(clearanceTier)) {
        return;
      }
      const hero = this.heroes.add({ ...draft, clearanceTier });
      await this.router.navigate(['/detail', hero.id]);
    });
  }
}
