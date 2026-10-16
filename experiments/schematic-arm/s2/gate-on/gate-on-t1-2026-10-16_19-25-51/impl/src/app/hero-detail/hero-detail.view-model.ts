import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { initialsOf } from '../domain/hero.initials';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { HeroService } from '../domain/hero.service';

/** The edit form's starting values for a hero. Blank when no hero is loaded. */
function toModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? POWER_CLASSES[0],
    powerIndex: hero?.powerIndex ?? 0,
  };
}

/** How a success rate reads in the Missions tab. */
export interface MissionOutcome {
  readonly label: string;
  readonly variant: 'success' | 'warning' | 'destructive' | 'secondary';
}

/** Loads one hero from the detail/:id route and owns its edit form and retirement. */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * The id from detail/:id. Read through paramMap, not the snapshot alone, because
   * the router reuses this screen when only the id changes.
   */
  readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly hero = computed(() => this.heroes.find(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));

  /** Labels, control kinds and options for the edit form, read off the schema. */
  readonly meta = formMeta(heroSchema);

  readonly missionOutcome = computed<MissionOutcome>(() => {
    const hero = this.hero();
    const rate = hero?.successRate ?? 0;
    if (!hero?.missionCount) {
      return { label: 'No record', variant: 'secondary' };
    }
    if (rate >= 75) {
      return { label: 'Strong', variant: 'success' };
    }
    if (rate >= 50) {
      return { label: 'Mixed', variant: 'warning' };
    }
    return { label: 'Weak', variant: 'destructive' };
  });

  /** A confirmation line shown after a save or a cancel. */
  readonly notice = signal('');

  /** The form's model. Re-seeded from the hero whenever the hero changes. */
  private readonly model = linkedSignal<HeroModel>(() => toModel(this.hero()));

  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema), {
    submission: {
      action: async (field) => {
        this.heroes.update(this.heroId(), field().value());
        this.notice.set('Changes saved.');
        return undefined;
      },
    },
  });

  /** Accepts the select's emitted value and keeps it only if it is a known power class. */
  setPowerClass(value: unknown): void {
    const next = POWER_CLASSES.find((powerClass: PowerClass) => powerClass === value);
    if (next !== undefined) {
      this.heroForm.powerClass().value.set(next);
    }
  }

  /** Discard unsaved edits and show the hero's saved values again. */
  reset(): void {
    this.model.set(toModel(this.hero()));
    this.notice.set('Edits discarded.');
  }

  /** Take the loaded hero off the roster and return to the roster. */
  retire(): void {
    if (this.heroes.remove(this.heroId())) {
      void this.router.navigateByUrl('/roster');
    }
  }
}
