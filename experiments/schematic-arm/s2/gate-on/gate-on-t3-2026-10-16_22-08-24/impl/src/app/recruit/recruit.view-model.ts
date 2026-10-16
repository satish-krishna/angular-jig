import { Injectable, inject, signal } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { recruitSchema, type RecruitModel } from './recruit.schema';

/** A blank enlistment file. The first power class and the lowest clearance tier are the starting choices. */
const BLANK_RECRUIT: RecruitModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  clearanceTier: 1,
};

/**
 * The recruit screen's state: a blank enlistment file validated by the zod
 * schema, and the action that adds the hero to the roster.
 */
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  /** Labels and options come off the schema, so the template restates neither. */
  readonly fields = formMeta(recruitSchema);
  readonly powerClassOptions = this.fields.powerClass.options ?? [];

  private readonly model = signal<RecruitModel>({ ...BLANK_RECRUIT });

  /** The enlistment form. Validation runs through the schema; submit runs `enlist`. */
  readonly recruitForm = form(
    this.model,
    (path) => validateStandardSchema(path, recruitSchema),
    { submission: { action: () => this.enlist() } },
  );

  /** The select is not a signal-forms control, so it binds through here. */
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value == null) return;
    this.model.update((current) => ({ ...current, powerClass: value }));
  }

  /** Add the recruit to the roster, then open their new dossier. */
  private async enlist(): Promise<void> {
    const hero = this.heroService.add(this.model());
    await this.router.navigate(['/detail', hero.id]);
  }
}
