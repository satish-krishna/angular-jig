import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { isClearanceTier, isPowerClass } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 50,
  clearance: 'Tier 2',
};

/**
 * State for the recruit screen: the recruit form built from the zod schema, and the save that
 * adds the hero to the roster and opens their dossier. Component-scoped, so every visit starts
 * from a blank form.
 */
@Injectable()
export class RecruitViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);

  /** Field labels, control kinds, and select options, read off the schema. */
  public readonly labels = formMeta(recruitSchema);
  public readonly powerClassOptions = this.labels['powerClass'].options ?? [];
  public readonly clearanceOptions = this.labels['clearance'].options ?? [];

  private readonly _model = signal<RecruitModel>(BLANK_RECRUIT);

  public readonly recruitForm = form(this._model, (path) => validateStandardSchema(path, recruitSchema));

  /** Adds the recruit to the roster and opens the new hero's dossier. Invalid input never gets here. */
  public readonly save = () =>
    submit(this.recruitForm, async () => {
      const hero = this._heroes.recruit(this._model());
      void this._router.navigateByUrl(`/detail/${hero.id}`);
      return undefined;
    });

  /** Sets the power class from the select; the select is not a native control, so it is bound by hand. */
  public setPowerClass(value: unknown): void {
    if (isPowerClass(value)) {
      this._model.update((model) => ({ ...model, powerClass: value }));
    }
  }

  /** Sets the clearance tier from the select; a value outside the tiers leaves the model unchanged. */
  public setClearance(value: unknown): void {
    if (isClearanceTier(value)) {
      this._model.update((model) => ({ ...model, clearance: value }));
    }
  }
}
