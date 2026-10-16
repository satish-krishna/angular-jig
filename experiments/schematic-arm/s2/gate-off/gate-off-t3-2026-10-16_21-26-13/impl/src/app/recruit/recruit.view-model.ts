import { inject, Injectable, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { PowerClass } from '../domain/hero.model';
import { recruitSchema } from '../domain/hero-dossier.schema';
import type { RecruitModel } from '../domain/hero-dossier.schema';
import { formMeta } from '../forms/zod-meta';

const EMPTY_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 50,
  notes: '',
};

/** Component-scoped: the recruit screen provides it, so each visit starts with a blank form. */
@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  private readonly model = signal<RecruitModel>(EMPTY_RECRUIT);

  /** Read-only view of the draft, for the controls that bind a value rather than a field. */
  readonly draft = this.model.asReadonly();

  readonly form = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  readonly meta = formMeta(recruitSchema);

  /** Adds the recruit to the roster and opens their new dossier. The record is written once per submit. */
  readonly save = () =>
    submit(this.form, async (field) => {
      // The field value has passed validation, so this parse only applies the schema's trimming.
      const id = this.heroes.recruit(recruitSchema.parse(field().value()));
      void this.router.navigate(['/detail', id]);
    });

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, powerClass: value }));
    }
  }
}
