import { inject, Injectable, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { recruitSchema, type RecruitModel } from '../domain/hero-form.schema';
import { formMeta } from '../forms/zod-meta';

/** A blank recruit: the first power class, a middling index, and the lowest clearance. */
const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 50,
  clearance: 1,
  notes: '',
};

@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  /** Labels and select options, read off the schema so they are not restated here. */
  readonly fieldMeta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>({ ...BLANK_RECRUIT });

  readonly recruitForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: {
      action: async () => {
        this.recruit();
        return undefined;
      },
    },
  });

  /** Adds the recruit to the roster and opens their dossier. */
  private recruit(): void {
    const hero = this.heroes.recruit(this.model());
    void this.router.navigate(['/detail', hero.id]);
  }
}
