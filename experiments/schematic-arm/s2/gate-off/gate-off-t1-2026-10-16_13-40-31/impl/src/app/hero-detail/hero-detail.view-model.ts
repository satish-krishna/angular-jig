import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero, type HeroStatus, type PowerClass } from '../domain/hero.model';
import { MISSION_RESULT_VARIANTS, type MissionBadgeVariant, type MissionResult } from '../domain/mission.model';
import { POWER_ABILITIES } from '../domain/power-abilities';
import { formMeta } from '../forms/zod-meta';
import { heroDetailSchema, type HeroModel } from './hero-detail.schema';

/** The four tabbed panels on the hero detail screen. */
export const HERO_TABS = ['overview', 'powers', 'missions', 'edit'] as const;
export type HeroTab = (typeof HERO_TABS)[number];

/** How far each signature ability steps down from the overall power index. */
const ABILITY_STEP = 5;

function toFormModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? POWER_CLASSES[0],
    powerIndex: hero?.powerIndex ?? 0,
    notes: hero?.notes ?? '',
    active: hero?.status === 'Active',
  };
}

/**
 * The Active switch only moves the status between Active and Reserve. Injured and MIA
 * heroes keep their status unless the switch is actually flipped.
 */
function statusFor(active: boolean, current: HeroStatus): HeroStatus {
  if (active === (current === 'Active')) return current;
  return active ? 'Active' : 'Reserve';
}

/** Loads one hero by the route id and owns the detail screen's state. Component-scoped; no DOM. */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The hero id from the `detail/:id` route. Read as a signal so a reused screen follows the id. */
  readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    requireSync: true,
  });

  readonly hero = computed(() => this.heroes.byId(this.heroId()));
  readonly missions = computed(() => this.heroes.missionsFor(this.heroId()));
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  readonly initials = computed(() =>
    (this.hero()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(''),
  );

  /** Power-class and clearance facts for the dossier list. */
  readonly dossier = computed(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Hero ID', value: hero.id },
      { label: 'Alias', value: hero.alias },
      { label: 'Power class', value: hero.powerClass },
      { label: 'Status', value: hero.status },
      { label: 'Clearance', value: `Tier ${hero.clearanceTier}` },
    ];
  });

  /**
   * Signature abilities with a level each. Levels are estimated from the overall power index
   * (see ABILITY_STEP); the source data does not carry per-ability ratings.
   */
  readonly abilities = computed(() => {
    const hero = this.hero();
    if (!hero) return [];
    return POWER_ABILITIES[hero.powerClass].map((name, index) => ({
      name,
      level: Math.max(0, hero.powerIndex - index * ABILITY_STEP),
    }));
  });

  readonly tab = signal<HeroTab>('overview');
  /** A status line for the screen: what the last action did. Announced politely. */
  readonly notice = signal('');

  readonly meta = formMeta(heroDetailSchema);

  private readonly model = linkedSignal<HeroModel>(() => toFormModel(this.hero()));

  /** The Edit form. Submission goes through `submission.action`, so the template needs no ngSubmit. */
  readonly form = form(this.model, (path) => validateStandardSchema(path, heroDetailSchema), {
    submission: {
      action: async () => {
        this.save();
      },
    },
  });

  setTab(value: string): void {
    if ((HERO_TABS as readonly string[]).includes(value)) {
      this.tab.set(value as HeroTab);
    }
  }

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) this.form.powerClass().value.set(value);
  }

  resultVariant(result: MissionResult): MissionBadgeVariant {
    return MISSION_RESULT_VARIANTS[result];
  }

  deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) return;
    this.heroes.deploy(hero.id);
    this.notice.set(`Deployed ${hero.name}. Logged in the mission record.`);
  }

  /** Removes the hero from the roster and returns to it. The dialog closes in the template. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroes.retire(hero.id);
    void this.router.navigateByUrl('/roster');
  }

  /** Discards unsaved edits and returns to the overview. */
  cancel(): void {
    this.model.set(toFormModel(this.hero()));
    this.form().reset();
    this.notice.set('');
    this.tab.set('overview');
  }

  private save(): void {
    const hero = this.hero();
    if (!hero) return;
    const model = this.model();
    this.heroes.update(hero.id, {
      name: model.name.trim(),
      alias: model.alias.trim(),
      powerClass: model.powerClass,
      powerIndex: model.powerIndex,
      notes: model.notes.trim(),
      status: statusFor(model.active, hero.status),
    });
    this.form().reset();
    this.notice.set('Changes saved.');
  }
}
