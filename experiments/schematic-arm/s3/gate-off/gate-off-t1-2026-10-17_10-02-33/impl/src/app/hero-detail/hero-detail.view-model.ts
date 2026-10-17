import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { type Hero, type PowerClass } from '../domain/hero.model';
import { MissionService } from '../domain/mission.service';
import { mostUrgentThreat } from '../domain/threat.data';
import { STATUS_VARIANT, initialsOf, type StatusVariant } from '../ui/hero-status';
import { missionLine, type MissionLine } from '../ui/mission-status';

// EXAMPLE DATA. The abilities a power class is known for, for the Powers tab. The roster does not
// carry per-hero abilities, so every hero of a class shows the same list.
export const POWER_ABILITIES: Readonly<Record<PowerClass, readonly string[]>> = {
  Aerial: ['Flight', 'Wind shear'],
  Energy: ['Plasma bolts', 'Overcharge'],
  Psionic: ['Mind link', 'Threat sense'],
  Tech: ['Drone swarm', 'System override'],
  Mutant: ['Regeneration', 'Adaptive hide'],
  Cosmic: ['Gravity wells', 'Starlight burst'],
  Enhanced: ['Super strength', 'Reinforced frame'],
};

export interface DossierEntry {
  readonly label: string;
  readonly value: string;
}

export interface MissionRecord {
  readonly missions: number;
  readonly won: number;
  readonly lost: number;
  readonly rate: number;
  readonly rateVariant: StatusVariant;
}

// What the form shows when no hero matches the route. The form is not rendered in that state.
const BLANK_MODEL: HeroModel = { name: '', alias: '', powerClass: 'Aerial', powerIndex: 0, clearance: 'Tier 1' };

function toModel(hero: Hero): HeroModel {
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    clearance: hero.clearance,
  };
}

// The detail screen's state: which hero the route names, the edit draft and its form, and the actions.
// Component-scoped: the HeroDetail component provides it. It has no DOM.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // The router reuses this component when only the id changes, so the id is read as a stream, not a snapshot.
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusVariant = computed<StatusVariant>(() => {
    const hero = this.hero();
    return hero ? STATUS_VARIANT[hero.status] : 'outline';
  });
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  readonly summary = computed(() => {
    const hero = this.hero();
    return hero ? `${hero.name} (${hero.alias}) is ${hero.status.toLowerCase()} and cleared to ${hero.clearance}.` : '';
  });

  readonly dossier = computed<readonly DossierEntry[]>(() => {
    const hero = this.hero();
    if (!hero) {
      return [];
    }
    return [
      { label: 'Hero ID', value: hero.id },
      { label: 'Alias', value: hero.alias },
      { label: 'Power class', value: hero.powerClass },
      { label: 'Clearance', value: hero.clearance },
      { label: 'Status', value: hero.status },
    ];
  });

  readonly abilities = computed<readonly string[]>(() => {
    const hero = this.hero();
    return hero ? POWER_ABILITIES[hero.powerClass] : [];
  });

  // Won and lost are derived from the record the roster carries: the mission count and success rate.
  readonly record = computed<MissionRecord>(() => {
    const hero = this.hero();
    const missions = hero?.missionCount ?? 0;
    const rate = hero?.successRate ?? 0;
    const won = Math.round((missions * rate) / 100);
    return { missions, won, lost: missions - won, rate, rateVariant: rate >= 85 ? 'success' : 'outline' };
  });

  // The deployments this hero is on, from the shared mission state.
  readonly missions = computed<readonly MissionLine[]>(() =>
    this.missionService.forHero(this.heroId()).map(missionLine),
  );

  // The edit draft is the form's model. It follows the hero, so a route change or a save resets it.
  private readonly draft = linkedSignal<HeroModel>(() => {
    const hero = this.hero();
    return hero ? toModel(hero) : BLANK_MODEL;
  });

  readonly heroForm = form(this.draft, (path) => validateStandardSchema(path, heroSchema));

  // Set when a save lands, cleared by reset, so the Edit tab can confirm it.
  readonly saved = signal(false);

  save(): void {
    void submit(this.heroForm, async () => {
      const hero = this.hero();
      if (!hero) {
        return;
      }
      // Parse, not the raw draft: the schema trims the text fields and the service keeps what it is given.
      this.heroService.update(hero.id, heroSchema.parse(this.draft()));
      this.saved.set(true);
    });
  }

  reset(): void {
    const hero = this.hero();
    if (hero) {
      this.draft.set(toModel(hero));
    }
    this.saved.set(false);
  }

  // Deploying records a live mission against the most urgent threat, then opens the missions screen on this hero.
  // Only an active hero can be deployed.
  deploy(): void {
    const hero = this.hero();
    const threat = mostUrgentThreat();
    if (hero?.status === 'Active' && threat) {
      this.missionService.deploy(hero.id, threat.id);
      void this.router.navigate(['/missions'], { queryParams: { hero: hero.id } });
    }
  }

  // Retiring removes the hero from the roster and returns to it. The confirmation dialog asks first.
  retire(): void {
    const hero = this.hero();
    if (hero) {
      this.heroService.retire(hero.id);
      void this.router.navigate(['/roster']);
    }
  }
}
