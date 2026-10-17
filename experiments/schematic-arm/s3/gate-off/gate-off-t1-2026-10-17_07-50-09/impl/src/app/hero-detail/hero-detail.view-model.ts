import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import {
  CLEARANCE_TIERS,
  POWER_CLASSES,
  canDeploy as statusAllowsDeploy,
  type Hero,
  type HeroStatus,
  type PowerClass,
} from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { deploymentsFor } from '../domain/deployments';
import { initialsOf, STATUS_VARIANT } from '../ui/hero-display';
import { heroEditSchema, type HeroModel } from './hero-detail.schema';

export interface DetailRow {
  readonly label: string;
  readonly value: string;
}

export interface Meter {
  readonly id: string;
  readonly label: string;
  /** 0-100, the bar's fill. */
  readonly value: number;
  readonly detail: string;
}

export interface Deployment {
  readonly id: string;
  readonly name: string;
  readonly outcome: 'Success' | 'Setback';
  readonly outcomeVariant: BadgeVariants['variant'];
}

// EXAMPLE DATA. Abilities are invented for the demo roster.
const ABILITIES: Readonly<Record<PowerClass, readonly string[]>> = {
  Aerial: ['Flight', 'Gust burst', 'Aerial recon'],
  Energy: ['Plasma bolt', 'Surge shield', 'Grid overload'],
  Psionic: ['Telepathic ping', 'Mind shield', 'Thought lock'],
  Tech: ['Drone link', 'System hack', 'Field forge'],
  Mutant: ['Regeneration', 'Adaptive hide', 'Bio-sense'],
  Cosmic: ['Gravity well', 'Phase step', 'Star forge'],
  Enhanced: ['Super strength', 'Reflex boost', 'Durability'],
};

const RECENT_DEPLOYMENTS = 5;
const CLEARANCE_STEP = 20;

const BLANK_MODEL: HeroModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  notes: '',
  active: false,
};

/** The form starts from what is stored; a blank model stands in while no hero matches. */
function editModelFor(hero: Hero | undefined): HeroModel {
  if (!hero) return BLANK_MODEL;
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    notes: hero.notes,
    active: hero.status === 'Active',
  };
}

/** Switching the roster flag off demotes an active hero to Reserve; other statuses hold. */
function statusFor(current: HeroStatus, active: boolean): HeroStatus {
  if (active) return 'Active';
  return current === 'Active' ? 'Reserve' : current;
}

@Injectable() // no providedIn: scoped to the HeroDetail component that provides it
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // The route id. A snapshot would stick to the first hero when only the id changes.
  private readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly hero = computed(() => this.heroService.list().find((hero) => hero.id === this.heroId()));

  readonly initials = computed(() => initialsOf(this.hero()?.name ?? 'Unknown hero'));

  readonly statusVariant = computed<BadgeVariants['variant']>(() => {
    const status = this.hero()?.status;
    return status ? STATUS_VARIANT[status] : 'secondary';
  });

  readonly canDeploy = computed(() => {
    const status = this.hero()?.status;
    return status !== undefined && statusAllowsDeploy(status);
  });

  readonly summary = computed(() => {
    const hero = this.hero();
    if (!hero) return '';
    return `${hero.name} (${hero.alias}) is a ${hero.powerClass}-class hero at ${hero.clearance} clearance, currently ${hero.status.toLowerCase()}.`;
  });

  readonly miniStats = computed<readonly DetailRow[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Missions on record', value: String(hero.missionCount) },
      { label: 'Success rate', value: `${hero.successRate}%` },
      { label: 'Power index', value: String(hero.powerIndex) },
    ];
  });

  readonly dossier = computed<readonly DetailRow[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Hero ID', value: hero.id },
      { label: 'Alias', value: hero.alias },
      { label: 'Power class', value: hero.powerClass },
      { label: 'Clearance', value: hero.clearance },
      { label: 'Status', value: hero.status },
      { label: 'Notes', value: hero.notes || 'None on file.' },
    ];
  });

  readonly meters = computed<readonly Meter[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    const tier = CLEARANCE_TIERS.indexOf(hero.clearance) + 1;
    return [
      { id: 'power', label: 'Power index', value: hero.powerIndex, detail: `${hero.powerIndex} of 100` },
      {
        id: 'success',
        label: 'Mission success',
        value: hero.successRate,
        detail: `${hero.successRate}% across ${hero.missionCount} missions`,
      },
      {
        id: 'clearance',
        label: 'Clearance',
        value: tier * CLEARANCE_STEP,
        detail: hero.clearance,
      },
    ];
  });

  readonly abilities = computed<readonly string[]>(() => {
    const powerClass = this.hero()?.powerClass;
    return powerClass ? ABILITIES[powerClass] : [];
  });

  readonly deployments = computed<readonly Deployment[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return deploymentsFor(hero, RECENT_DEPLOYMENTS).map((mission) => ({
      id: mission.id,
      name: mission.name,
      outcome: mission.won ? 'Success' : 'Setback',
      outcomeVariant: mission.won ? 'success' : 'destructive',
    }));
  });

  // Feedback line for the last action. It clears when the route moves to another hero.
  readonly notice = linkedSignal({ source: this.heroId, computation: () => '' });

  // Field labels, control kinds and select options come off the zod schema.
  readonly meta = formMeta(heroEditSchema);

  // Linked to the stored hero, so a deploy or save refreshes the form to what was saved.
  private readonly model = linkedSignal<HeroModel>(() => editModelFor(this.hero()));

  readonly form = form(this.model, (path) => validateStandardSchema(path, heroEditSchema));

  setPowerClass(value: string | null | undefined): void {
    const powerClass = POWER_CLASSES.find((option) => option === value);
    if (powerClass) this.form.powerClass().value.set(powerClass);
  }

  setActive(active: boolean): void {
    this.form.active().value.set(active);
  }

  /** Drops unsaved edits and returns the form to the stored record. */
  discard(): void {
    this.model.set(editModelFor(this.hero()));
    this.notice.set('');
  }

  save(event: Event): void {
    event.preventDefault();
    void submit(this.form, async () => {
      const hero = this.hero();
      if (!hero) return;
      const value = heroEditSchema.parse(this.model());
      this.heroService.update(hero.id, {
        name: value.name,
        alias: value.alias,
        powerClass: value.powerClass,
        powerIndex: value.powerIndex,
        notes: value.notes,
        status: statusFor(hero.status, value.active),
      });
      this.notice.set(`Saved changes to ${value.name}.`);
    });
  }

  deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) return;
    this.heroService.deploy(hero.id);
    this.notice.set(`${hero.name} is deployed.`);
  }

  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.retire(hero.id);
    void this.router.navigate(['/roster']);
  }
}
