import { inject, Injectable, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { POWER_CLASSES, type PowerClass } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/**
 * State for the recruit screen: the intake form and the save action. Component-scoped,
 * so each visit starts from a blank form. A saved recruit opens on its new dossier.
 */
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  /** Labels, control kinds and options, read off the schema so the template restates none of them. */
  readonly fieldMeta = formMeta(recruitSchema);

  private readonly model = signal<RecruitModel>({
    name: '',
    alias: '',
    powerClass: POWER_CLASSES[0],
    powerIndex: 50,
    clearance: 'Tier 1',
    notes: '',
  });
  readonly recruitForm = form(this.model, (path) => validateStandardSchema(path, recruitSchema));

  /** The select reports an empty selection as null; an empty selection keeps the current class. */
  setPowerClass(powerClass: PowerClass | null | undefined): void {
    if (powerClass) {
      this.model.update((model) => ({ ...model, powerClass }));
    }
  }

  /** Save through the schema-validated form. Invalid input never reaches the action. */
  save = (event: Event) => {
    event.preventDefault();
    return submit(this.recruitForm, async () => {
      const hero = this.heroService.add(this.model());
      await this.router.navigate(['/detail', hero.id]);
    });
  };

  /** Leave without recruiting. */
  cancel(): void {
    void this.router.navigate(['/roster']);
  }
}
