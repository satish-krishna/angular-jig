import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { clearanceLabel, POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import type { Mission } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { initialsOf, MISSION_BADGE, STATUS_BADGE, type MissionBadge, type StatusBadge } from '../ui/hero-presentation';
import { heroEditPatch, heroSchema, toHeroModel, type HeroModel } from './hero-detail.schema';

export const DETAIL_TABS = ['overview', 'powers', 'missions', 'edit'] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

/** One deployment of this hero, read from the shared mission log. */
export interface DeploymentRow {
  readonly mission: Mission;
  readonly threatName: string;
  readonly statusBadge: MissionBadge;
}

// Only used while no hero matches the route; the form is not shown then.
const BLANK_MODEL: HeroModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 0,
  notes: '',
  active: false,
};

/** Everything the detail screen shows for a hero that exists. */
export interface HeroView {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusBadge: StatusBadge;
  readonly clearance: string;
  /** Successful missions, derived from the success rate. The roster keeps totals; deployments come from the log. */
  readonly successes: number;
  readonly failures: number;
  /** Deploy is for Active heroes only. */
  readonly canDeploy: boolean;
}

// The hero detail screen's state and logic, no DOM. Component-scoped (no providedIn): the
// HeroDetail component provides it, so each hero starts with a clean tab and a fresh form.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);
  private readonly router = inject(Router);

  // The router reuses this component when only the id changes, so the id is a stream, not a snapshot.
  readonly heroId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { requireSync: true },
  );

  private readonly hero = computed(() => this.heroService.findById(this.heroId()));

  readonly view = computed<HeroView | null>(() => {
    const hero = this.hero();
    if (!hero) {
      return null;
    }
    const successes = Math.round((hero.missionCount * hero.successRate) / 100);
    return {
      hero,
      initials: initialsOf(hero.name),
      statusBadge: STATUS_BADGE[hero.status],
      clearance: clearanceLabel(hero.clearanceTier),
      successes,
      failures: hero.missionCount - successes,
      canDeploy: hero.status === 'Active',
    };
  });

  // This hero's deployments, newest first, so a launch from the missions screen shows up here.
  readonly deployments = computed<readonly DeploymentRow[]>(() => {
    const hero = this.hero();
    if (!hero) {
      return [];
    }
    return this.missionService.forHero(hero.id).map((mission) => ({
      mission,
      threatName: this.threatService.findById(mission.threatId)?.name ?? mission.threatId,
      statusBadge: MISSION_BADGE[mission.status],
    }));
  });

  readonly activeTab = signal<DetailTab>('overview');

  readonly meta = formMeta(heroSchema);
  readonly powerClasses = POWER_CLASSES;

  // Follows the hero: when the route moves to another hero, or a save lands, the form re-reads the record.
  private readonly model = linkedSignal<HeroModel>(() => {
    const hero = this.hero();
    return hero ? toHeroModel(hero) : BLANK_MODEL;
  });

  // Submission goes through submission.action, which the FormRoot on the edit form fires.
  readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema), {
    submission: { action: () => this.save() },
  });

  selectTab(value: string): void {
    if (isDetailTab(value)) {
      this.activeTab.set(value);
    }
  }

  // The select reports null or undefined when it has no choice; the form keeps its class then.
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, powerClass: value }));
    }
  }

  setActive(value: boolean): void {
    this.model.update((model) => ({ ...model, active: value }));
  }

  cancelEdit(): void {
    const hero = this.hero();
    if (hero) {
      this.model.set(toHeroModel(hero));
    }
    this.activeTab.set('overview');
  }

  deploy(): void {
    const hero = this.hero();
    if (hero?.status === 'Active') {
      void this.router.navigate(['/missions'], { queryParams: { hero: hero.id } });
    }
  }

  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroService.retire(hero.id);
    void this.router.navigate(['/roster']);
  }

  private async save(): Promise<void> {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroService.update(hero.id, heroEditPatch(hero, this.model()));
  }
}

function isDetailTab(value: string): value is DetailTab {
  return (DETAIL_TABS as readonly string[]).includes(value);
}
