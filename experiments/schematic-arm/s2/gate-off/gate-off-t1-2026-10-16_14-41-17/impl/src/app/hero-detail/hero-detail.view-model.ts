import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { initialsOf } from '../domain/initials';
import { heroEditSchema, type HeroModel } from './hero-detail.schema';

const DETAIL_TABS = ['overview', 'powers', 'missions', 'edit'] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

function isDetailTab(value: string): value is DetailTab {
  return (DETAIL_TABS as readonly string[]).includes(value);
}

/** EXAMPLE DATA. The roster carries no ability list, so each power class has a fixed set. */
const ABILITIES: Readonly<Record<PowerClass, readonly string[]>> = {
  Aerial: ['Flight', 'High-altitude recon', 'Rapid extraction'],
  Energy: ['Directed energy', 'Overcharge', 'Thermal output'],
  Psionic: ['Mind shield', 'Empathic read', 'Stealth field'],
  Tech: ['Drone control', 'Field gadgets', 'Tactical AI link'],
  Mutant: ['Adaptive physiology', 'Accelerated healing', 'Sensory boost'],
  Cosmic: ['Gravity well', 'Short-range teleport', 'Stellar resilience'],
  Enhanced: ['Super strength', 'Hardened frame', 'Reflex boost'],
};

/**
 * State for the hero detail screen: the hero named by the route, the active tab,
 * the edit form, and the deploy and retire actions. Component-scoped, so it dies
 * with the screen and each visit to a dossier starts from a fresh form.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Follows the route's id, so a reused component reloads when only the id changes. */
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** The hero this screen shows, or undefined when no hero has the routed id. */
  readonly hero = computed(() => this.heroService.byId(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));

  readonly activeTab = signal<DetailTab>('overview');
  /** A short status line after a save, deploy or other action. */
  readonly notice = signal('');

  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  readonly abilities = computed(() => {
    const hero = this.hero();
    return hero ? ABILITIES[hero.powerClass] : [];
  });

  /** Totals derived from the roster's aggregates; the example data has no per-mission log. */
  readonly outcomes = computed(() => {
    const hero = this.hero();
    const total = hero?.missionCount ?? 0;
    const successes = Math.round((total * (hero?.successRate ?? 0)) / 100);
    return { total, successes, failures: total - successes };
  });

  /** Labels, control kinds and options, read off the schema so the template restates none of them. */
  readonly fieldMeta = formMeta(heroEditSchema);

  /** The edit form's model. Re-derived from the hero whenever the hero changes, so a saved edit reloads cleanly. */
  private readonly model = linkedSignal<HeroModel>(() => this.toModel(this.hero()));
  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroEditSchema));

  selectTab(tab: string): void {
    if (isDetailTab(tab)) {
      this.activeTab.set(tab);
    }
  }

  /** The select reports an empty selection as null; an empty selection keeps the current class. */
  setPowerClass(powerClass: PowerClass | null | undefined): void {
    if (powerClass) {
      this.model.update((model) => ({ ...model, powerClass }));
    }
  }

  setActive(active: boolean): void {
    this.model.update((model) => ({ ...model, active }));
  }

  /** Save through the schema-validated form. Invalid input never reaches the action. */
  save = (event: Event) => {
    event.preventDefault();
    return submit(this.heroForm, async () => {
      const hero = this.hero();
      if (!hero) {
        return;
      }
      const next = this.model();
      // The switch maps to status: it only changes status when it is flipped, so an
      // Injured or MIA hero keeps that status through an unrelated edit.
      const status = next.active === (hero.status === 'Active') ? hero.status : next.active ? 'Active' : 'Reserve';
      this.heroService.update(hero.id, {
        name: next.name,
        alias: next.alias,
        powerClass: next.powerClass,
        powerIndex: next.powerIndex,
        notes: next.notes,
        status,
      });
      this.notice.set(`Saved ${next.name}.`);
    });
  };

  /** Throw away unsaved edits and return to the overview. */
  discardEdits(): void {
    this.model.set(this.toModel(this.hero()));
    this.activeTab.set('overview');
  }

  /** Log a deployment. Only an Active hero can deploy. */
  deploy(): void {
    const hero = this.hero();
    const missionCount = hero && this.heroService.deploy(hero.id);
    if (hero && missionCount !== undefined) {
      this.notice.set(`${hero.name} deployed. Missions logged: ${missionCount}.`);
    }
  }

  /** Remove the hero from the roster and return to it. The caller closes the confirmation first. */
  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroService.retire(hero.id);
    void this.router.navigate(['/roster']);
  }

  private toModel(hero: Hero | undefined): HeroModel {
    return {
      name: hero?.name ?? '',
      alias: hero?.alias ?? '',
      powerClass: hero?.powerClass ?? POWER_CLASSES[0],
      powerIndex: hero?.powerIndex ?? 0,
      notes: hero?.notes ?? '',
      active: hero?.status === 'Active',
    };
  }
}
