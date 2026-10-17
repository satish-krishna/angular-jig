import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { Hero } from '../domain/hero.model';
import { heroInitials, type HeroStatusVariant, STATUS_VARIANT } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { OUTCOME_VARIANT } from '../domain/mission.presentation';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { formMeta } from '../forms/zod-meta';

// Shown in the edit form when the id matches no hero. The screen shows a not-found card instead.
const BLANK_MODEL: HeroModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 0,
  status: 'Reserve',
  clearance: 'Tier 1',
};

function toFormModel(hero: Hero | undefined): HeroModel {
  if (!hero) return BLANK_MODEL;
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    status: hero.status,
    clearance: hero.clearance,
  };
}

type SelectField = 'powerClass' | 'status' | 'clearance';

// Hero detail state and logic. Component-scoped: the component provides it, so each hero starts with a fresh form.
@Injectable()
export class HeroDetailViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _missions = inject(MissionService);
  private readonly _threats = inject(ThreatService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  // The id comes from the route. toSignal keeps it live when the router reuses this component for another id.
  private readonly _heroId = toSignal(this._route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  public readonly hero = computed<Hero | undefined>(() => this._heroes.byId(this._heroId()));
  public readonly initials = computed(() => {
    const hero = this.hero();
    return hero ? heroInitials(hero.name) : '';
  });
  public readonly statusVariant = computed<HeroStatusVariant>(() => {
    const hero = this.hero();
    return hero ? STATUS_VARIANT[hero.status] : 'outline';
  });
  // Only an active hero can be deployed.
  public readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  // Every deployment on the mission log for this hero, newest first.
  public readonly deployments = computed(() =>
    this._missions
      .missions()
      .filter((mission) => mission.heroId === this._heroId())
      .sort((a, b) => b.launched.localeCompare(a.launched) || b.id.localeCompare(a.id))
      .map((mission) => ({
        id: mission.id,
        threatName: this._threats.byId(mission.threatId)?.name ?? 'Unknown threat',
        launched: mission.launched,
        outcome: mission.outcome,
        variant: OUTCOME_VARIANT[mission.outcome],
      })),
  );

  public readonly tab = signal<string>('overview');

  public readonly meta = formMeta(heroSchema);

  // The form model follows the loaded hero. linkedSignal resets it when the hero changes, so the form never shows another hero's values.
  private readonly _model = linkedSignal<HeroModel>(() => toFormModel(this.hero()));
  public readonly form = form(this._model, (path) => validateStandardSchema(path, heroSchema), {
    submission: {
      action: async () => {
        this.saveEdits();
        return undefined;
      },
    },
  });

  // Set after a successful save; cleared when the route moves to another hero.
  public readonly saved = linkedSignal({ source: this._heroId, computation: () => false });

  public selectTab(tab: string): void {
    this.tab.set(tab);
  }

  public discardEdits(): void {
    this._model.set(toFormModel(this.hero()));
    this.tab.set('overview');
  }

  public deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) return;

    void this._router.navigate(['/missions'], { queryParams: { hero: hero.id } });
  }

  public retire(): void {
    if (!this._heroes.retire(this._heroId())) return;

    void this._router.navigate(['/roster']);
  }

  // A select reports null when it is cleared. Keep the current choice in that case.
  public choose<K extends SelectField>(field: K, value: HeroModel[K] | null | undefined): void {
    if (!value) return;

    this._model.update((model) => ({ ...model, [field]: value }));
  }

  private saveEdits(): void {
    const changes = heroSchema.parse(this._model());
    this._heroes.update(this._heroId(), changes);
    this.saved.set(true);
  }
}
