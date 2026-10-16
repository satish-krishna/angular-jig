import { Injectable, inject, linkedSignal, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/** Starting values for a blank recruit form. */
const BLANK: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  notes: '',
};

/** Holds the recruit form and adds the hero to the roster when it validates. Component-scoped; no DOM. */
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  readonly meta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>(BLANK);

  /** Submission goes through `submission.action`, so the template needs no ngSubmit. */
  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: {
      action: async () => {
        this.recruit();
      },
    },
  });

  /** Keeps the typed class in step with the select. */
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) this.form.powerClass().value.set(value);
  }

  private recruit(): void {
    const model = this.model();
    const id = this.heroes.recruit({
      name: model.name.trim(),
      alias: model.alias.trim(),
      powerClass: model.powerClass,
      powerIndex: model.powerIndex,
      notes: model.notes.trim(),
    });
    void this.router.navigate(['/detail', id]);
  }
}
