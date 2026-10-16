import { computed, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { Hero, HeroStatus } from '../domain/hero';
import { HeroService, type HeroChanges } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { initialsOf } from '../domain/initials';
import { formMeta } from '../forms/zod-meta';
import type { StatIcon } from '../ui/stat-tile';
import { heroSchema, type HeroModel } from '../domain/hero-form.schema';

export type HeroTab = 'overview' | 'powers' | 'missions' | 'edit';

const HERO_TABS: readonly HeroTab[] = ['overview', 'powers', 'missions', 'edit'];

/** The select and tabs emit whatever value they were given, so narrow it before storing. */
function isHeroTab(value: unknown): value is HeroTab {
  return HERO_TABS.some((tab) => tab === value);
}

export interface DetailStat {
  readonly label: string;
  readonly value: number;
  readonly icon: StatIcon;
}

/** The edit form's starting values. Blank while no hero matches the route. */
function toModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? 'Aerial',
    powerIndex: hero?.powerIndex ?? 0,
    clearance: hero?.clearance ?? 1,
    notes: hero?.notes ?? '',
    active: hero?.status === 'Active',
  };
}

/**
 * The Active switch maps onto the roster status. On always means Active. Off
 * moves an Active hero to Reserve and leaves Injured or MIA heroes where they are.
 */
function statusFor(active: boolean, current: HeroStatus): HeroStatus {
  if (active) return 'Active';
  return current === 'Active' ? 'Reserve' : current;
}

function toChanges(model: HeroModel, hero: Hero): HeroChanges {
  return {
    name: model.name,
    alias: model.alias,
    powerClass: model.powerClass,
    powerIndex: model.powerIndex,
    clearance: model.clearance,
    notes: model.notes,
    status: statusFor(model.active, hero.status),
  };
}

@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missionLog = inject(MissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The :id route parameter, converted at the edge so a reused screen follows the id. */
  readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    requireSync: true,
  });

  readonly hero = computed(() => {
    const id = this.heroId();
    return id === null ? undefined : this.heroes.byId(id);
  });

  /** Missions this hero took part in, newest first. */
  readonly heroMissions = computed(() => {
    const hero = this.hero();
    return hero ? this.missionLog.forHero(hero.id) : [];
  });

  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  readonly miniStats = computed<readonly DetailStat[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Power index', value: hero.powerIndex, icon: 'lucideZap' },
      { label: 'Missions on record', value: hero.missionCount, icon: 'lucideActivity' },
      { label: 'Success rate (%)', value: hero.successRate, icon: 'lucideCheck' },
    ];
  });

  /** Labels and select options, read off the schema so they are not restated here. */
  readonly fieldMeta = formMeta(heroSchema);

  readonly tab = signal<HeroTab>('overview');

  /** Last action's outcome, announced politely to screen readers. */
  readonly notice = signal('');

  /**
   * The form's model. It resets only when the route id changes, not when the
   * roster changes, so a deploy does not wipe edits that have not been saved yet.
   */
  private readonly model = linkedSignal<string | null, HeroModel>({
    source: this.heroId,
    computation: (id) =>
      toModel(untracked(() => (id === null ? undefined : this.heroes.byId(id)))),
  });

  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema), {
    submission: {
      action: async () => {
        this.save();
        return undefined;
      },
    },
  });

  selectTab(value: unknown): void {
    if (isHeroTab(value)) {
      this.tab.set(value);
    }
  }

  /** Discards unsaved edits and returns the form to the hero's saved values. */
  cancelEdit(): void {
    this.model.set(toModel(this.hero()));
    this.notice.set('');
  }

  /** Records a deployment. Only an Active hero can be sent out. */
  deploy(): void {
    const hero = this.hero();
    if (!hero || hero.status !== 'Active') return;
    const missionCount = hero.missionCount + 1;
    const mission = this.missionLog.deploy(hero.id);
    this.heroes.update(hero.id, { missionCount });
    this.notice.set(`${hero.name} deployed as ${mission.id}. Missions on record: ${missionCount}.`);
  }

  /** Takes the hero off the roster and returns to the roster screen. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroes.retire(hero.id);
    void this.router.navigate(['/roster']);
  }

  private save(): void {
    const id = this.heroId();
    const hero = this.hero();
    if (id === null || !hero) return;
    this.heroes.update(id, toChanges(this.model(), hero));
    this.notice.set('Changes saved.');
  }
}
