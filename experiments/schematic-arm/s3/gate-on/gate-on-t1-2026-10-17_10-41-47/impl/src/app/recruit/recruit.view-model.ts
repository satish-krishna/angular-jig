import { inject, Injectable, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { formMeta } from '../forms/zod-meta';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/** A fresh form model. Built per call so no two forms share one object. */
function blankRecruit(): RecruitModel {
  return { name: '', alias: '', powerClass: 'Aerial', powerIndex: 50, clearanceTier: 'Tier 1', notes: '' };
}

/** Component-scoped ViewModel for the Recruit screen: the intake form, which adds a hero to the roster on submit. */
@Injectable()
export class RecruitViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);

  /** Field labels, placeholders and select options, read off the zod schema. */
  readonly fields = formMeta(recruitSchema) as Record<keyof RecruitModel, FormFieldMeta>;

  readonly model = signal<RecruitModel>(blankRecruit());

  /** The intake form. Rules come from the zod schema; submission enlists the recruit when the model is valid. */
  readonly recruitForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: {
      action: async () => {
        this.enlist();
      },
    },
  });

  /** The select can emit null or an unknown value; only a value the schema accepts reaches the model. */
  setPowerClass(value: unknown): void {
    const parsed = recruitSchema.shape.powerClass.safeParse(value);
    if (parsed.success) this.model.update((model) => ({ ...model, powerClass: parsed.data }));
  }

  /** The select can emit null or an unknown value; only a value the schema accepts reaches the model. */
  setClearanceTier(value: unknown): void {
    const parsed = recruitSchema.shape.clearanceTier.safeParse(value);
    if (parsed.success) this.model.update((model) => ({ ...model, clearanceTier: parsed.data }));
  }

  /** Leaves the intake form without adding anyone. */
  cancel(): void {
    void this._router.navigate(['/roster']);
  }

  /** Adds the recruit to the roster and opens the new dossier. */
  private enlist(): void {
    const recruit = recruitSchema.parse(this.model());
    const hero = this._heroes.add(recruit);
    void this._router.navigate(['/detail', hero.id]);
  }
}
