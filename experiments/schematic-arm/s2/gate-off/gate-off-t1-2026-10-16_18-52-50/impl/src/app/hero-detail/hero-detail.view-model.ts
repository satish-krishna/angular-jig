import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { initialsOf, STATUS_VARIANT, type StatusVariant } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { heroEditSchema, type HeroModel } from './hero-detail.schema';
import type { StatFigure } from '../ui/stat-tile/stat-tile';

export type HeroDetailTab = 'overview' | 'powers' | 'missions' | 'edit';

const TABS: readonly HeroDetailTab[] = ['overview', 'powers', 'missions', 'edit'];

export interface DetailFact {
  readonly label: string;
  readonly value: string;
}

export interface MissionResult {
  readonly label: string;
  readonly variant: StatusVariant;
}

function isTab(value: unknown): value is HeroDetailTab {
  return (TABS as readonly unknown[]).includes(value);
}

function isPowerClass(value: unknown): value is PowerClass {
  return (POWER_CLASSES as readonly unknown[]).includes(value);
}

/** The edit form's starting values for a hero. With no hero, the form is blank and the screen shows not-found. */
function toEditModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? 'Aerial',
    powerIndex: hero?.powerIndex ?? 0,
    notes: hero?.notes ?? '',
    active: hero?.status === 'Active',
  };
}

/**
 * Hero detail state: the hero named by the route, its tab, its edit form, and the
 * deploy and retire actions. The form model follows the hero, so the form resets
 * when the route id changes or the hero is saved.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroes.byId(this.id()));
  readonly found = computed(() => this.hero() !== undefined);
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusVariant = computed(() => STATUS_VARIANT[this.hero()?.status ?? 'Reserve']);
  readonly deployable = computed(() => this.missions.canDeploy(this.hero()));

  readonly activeTab = signal<HeroDetailTab>('overview');

  readonly stats = computed<readonly StatFigure[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Power index', value: String(hero.powerIndex), detail: 'Scale 0 to 100', icon: 'lucideZap' },
      { label: 'Clearance', value: `Tier ${hero.clearanceTier}`, detail: 'Access level', icon: 'lucideShieldAlert' },
      {
        label: 'Missions',
        value: String(hero.missionCount),
        detail: `${hero.successRate}% success`,
        icon: 'lucideActivity',
      },
    ];
  });

  readonly dossier = computed<readonly DetailFact[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Hero ID', value: hero.id },
      { label: 'Power class', value: hero.powerClass },
      { label: 'Status', value: hero.status },
      { label: 'Clearance', value: `Tier ${hero.clearanceTier}` },
      { label: 'Notes', value: hero.notes || 'No notes on file.' },
    ];
  });

  /**
   * The mission record. A hero with no missions has no result yet. Otherwise the badge follows
   * the success rate: 75 and up good, 50 and up cautionary.
   */
  readonly missionResult = computed<MissionResult>(() => {
    const hero = this.hero();
    if (!hero || hero.missionCount === 0) return { label: 'No record', variant: 'secondary' };
    if (hero.successRate >= 75) return { label: 'Reliable', variant: 'success' };
    if (hero.successRate >= 50) return { label: 'Mixed', variant: 'warning' };
    return { label: 'At risk', variant: 'destructive' };
  });

  /** Labels, options and help text come off the schema, so the template restates none of them. */
  readonly meta = formMeta(heroEditSchema);

  /** The edit model follows the hero: a route change or a save re-derives it. */
  private readonly model = linkedSignal<HeroModel>(() => toEditModel(this.hero()));
  readonly form = form(this.model, (path) => validateStandardSchema(path, heroEditSchema));

  selectTab(value: unknown): void {
    if (isTab(value)) this.activeTab.set(value);
  }

  setPowerClass(value: unknown): void {
    if (isPowerClass(value)) this.form.powerClass().value.set(value);
  }

  setActive(value: boolean): void {
    this.form.active().value.set(value);
  }

  /** Save the edit form. Validation runs first; the status is kept except for the Active switch. */
  save(): Promise<boolean> {
    return submit(this.form, async () => {
      const hero = this.hero();
      if (!hero) return;
      const values = heroEditSchema.parse(this.model());
      this.heroes.update(hero.id, {
        name: values.name,
        alias: values.alias,
        powerClass: values.powerClass,
        powerIndex: values.powerIndex,
        notes: values.notes,
        status: values.active ? 'Active' : hero.status === 'Active' ? 'Reserve' : hero.status,
      });
    });
  }

  /** Discard unsaved edits and return to the overview. */
  cancel(): void {
    this.model.set(toEditModel(this.hero()));
    this.activeTab.set('overview');
  }

  /** Send an Active hero into the field. The mission service records it and the roster's count moves. */
  deploy(): void {
    const hero = this.hero();
    if (!hero) return;
    this.missions.deploy(hero.id);
  }

  /** Retire the hero, close their missions, and return to the roster. The template closes the confirmation dialog. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.missions.standDownFor(hero.id);
    this.heroes.retire(hero.id);
    void this.router.navigate(['/roster']);
  }
}
