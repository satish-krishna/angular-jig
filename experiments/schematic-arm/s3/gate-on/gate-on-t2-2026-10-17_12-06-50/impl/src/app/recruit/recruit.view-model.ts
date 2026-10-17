import { inject, Injectable, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { type RecruitModel, recruitSchema } from '../domain/hero.schema';
import { formMeta } from '../forms/zod-meta';

// Recruit state and logic. Component-scoped: the component provides it, so each visit opens a blank form.
@Injectable()
export class RecruitViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);

  public readonly meta = formMeta(recruitSchema);

  private readonly _model = signal<RecruitModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 50,
    clearance: 'Tier 1',
  });

  public readonly form = form(this._model, (path) => validateStandardSchema(path, recruitSchema), {
    submission: {
      action: async () => {
        this.recruit();
        return undefined;
      },
    },
  });

  // A select reports null when it is cleared. Keep the current choice in that case.
  public choose<K extends keyof RecruitModel>(field: K, value: RecruitModel[K] | null | undefined): void {
    if (!value) return;

    this._model.update((model) => ({ ...model, [field]: value }));
  }

  private recruit(): void {
    const hero = this._heroes.recruit(recruitSchema.parse(this._model()));
    void this._router.navigate(['/detail', hero.id]);
  }
}
