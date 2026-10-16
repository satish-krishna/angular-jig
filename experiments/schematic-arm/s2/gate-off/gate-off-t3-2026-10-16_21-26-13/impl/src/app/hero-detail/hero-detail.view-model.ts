import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { heroDossierSchema } from '../domain/hero-dossier.schema';
import type { HeroDossierModel } from '../domain/hero-dossier.schema';
import type { Hero, PowerClass, HeroStatus } from '../domain/hero.model';
import type { MissionOutcome } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { formMeta } from '../forms/zod-meta';
import { heroInitials, heroStatusVariant } from '../ui/hero-presentation';
import type { StatusVariant } from '../ui/hero-presentation';
import { missionOutcomeTone } from '../ui/mission-presentation';
import type { BadgeTone } from '../ui/mission-presentation';

export interface DossierStat {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: string;
}

/** One deployment of this hero, with its threat named for display. */
export interface Deployment {
  readonly id: string;
  readonly operation: string;
  readonly threat: string;
  readonly outcome: MissionOutcome;
  readonly outcomeTone: BadgeTone;
  readonly cycle: number;
}

// The form is built before the hero is known to exist, so it needs a value to start from.
// The page renders the form only when a hero is found, so this placeholder is never shown.
const EMPTY_DOSSIER: HeroDossierModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  powerIndex: 0,
  status: 'Active',
  notes: '',
};

function dossierOf(hero: Hero): HeroDossierModel {
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    status: hero.status,
    notes: hero.notes,
  };
}

/** Component-scoped: the detail screen provides it, so each hero starts with a fresh form. */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly threats = inject(ThreatService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // paramMap, not the snapshot: the router reuses this screen when only the id changes.
  private readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  /** The hero named in the route, or undefined when no hero has that id. */
  readonly hero = computed<Hero | undefined>(() => {
    const id = this.heroId();
    return this.heroes.roster().find((hero) => hero.id === id);
  });

  readonly initials = computed(() => {
    const hero = this.hero();
    return hero ? heroInitials(hero.name) : '';
  });

  readonly statusVariant = computed<StatusVariant>(() => {
    const hero = this.hero();
    return hero ? heroStatusVariant(hero.status) : 'secondary';
  });

  /** Deployment needs an Active hero. Injured, reserve, and MIA heroes cannot be sent out. */
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  readonly stats = computed<readonly DossierStat[]>(() => {
    const hero = this.hero();
    if (!hero) {
      return [];
    }
    return [
      { label: 'Missions', value: String(hero.missionCount), detail: 'Deployments on record', icon: 'lucideTarget' },
      { label: 'Mission success', value: `${hero.successRate}%`, detail: 'Across all deployments', icon: 'lucideCheck' },
      { label: 'Power index', value: String(hero.powerIndex), detail: 'Out of 100', icon: 'lucideZap' },
    ];
  });

  /** This hero's deployments from the shared mission log, newest first. */
  readonly deployments = computed<readonly Deployment[]>(() => {
    const id = this.hero()?.id;
    if (!id) {
      return [];
    }
    const codenames = new Map(this.threats.threats().map((threat) => [threat.id, threat.codename]));
    return this.missions
      .log()
      .filter((mission) => mission.heroId === id)
      .map((mission) => ({
        id: mission.id,
        operation: mission.operation,
        threat: mission.threatId ? (codenames.get(mission.threatId) ?? 'Unknown threat') : 'No threat assigned',
        outcome: mission.outcome,
        outcomeTone: missionOutcomeTone(mission.outcome),
        cycle: mission.cycle,
      }));
  });

  /** The dossier as it is being edited. It starts from the hero and resets whenever the hero changes. */
  private readonly model = linkedSignal<HeroDossierModel>(() => {
    const hero = this.hero();
    return hero ? dossierOf(hero) : EMPTY_DOSSIER;
  });

  /** Read-only view of the draft, for the controls that bind a value rather than a field. */
  readonly dossier = this.model.asReadonly();

  readonly form = form(this.model, (path) => validateStandardSchema(path, heroDossierSchema));

  readonly meta = formMeta(heroDossierSchema);

  /** True after a successful save, until the route moves to another hero. */
  readonly saved = linkedSignal<string, boolean>({ source: this.heroId, computation: () => false });

  readonly save = () =>
    submit(this.form, async (field) => {
      const hero = this.hero();
      if (!hero) {
        return;
      }
      // The field value has passed validation, so this parse only applies the schema's trimming.
      this.heroes.update(hero.id, heroDossierSchema.parse(field().value()));
      this.saved.set(true);
    });

  /** Discards unsaved edits and returns the form to the hero's stored values. */
  cancel(): void {
    const hero = this.hero();
    if (hero) {
      this.model.set(dossierOf(hero));
    }
    this.saved.set(false);
  }

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, powerClass: value }));
    }
  }

  setStatus(value: HeroStatus | null | undefined): void {
    if (value) {
      this.model.update((model) => ({ ...model, status: value }));
    }
  }

  /** Logs a deployment for this hero, then opens the missions log where it appears. */
  deploy(): void {
    const hero = this.hero();
    if (hero && this.canDeploy()) {
      this.missions.deploy(hero.id);
      void this.router.navigate(['/missions']);
    }
  }

  /** Retires the hero and leaves the screen. The dialog closes before this runs, so it cannot fire twice. */
  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroes.retire(hero.id);
    void this.router.navigate(['/roster']);
  }
}
