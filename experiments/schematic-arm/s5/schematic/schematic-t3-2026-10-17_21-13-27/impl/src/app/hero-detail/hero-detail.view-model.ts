import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { HeroPowerClass } from '../hero/hero.model';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';
import { heroPowerClassVariant, heroStatusVariant, monogramOf } from '../hero/hero-presentation';
import { MissionService } from '../mission/mission.service';
import { missionLabel, missionVariant } from '../mission/mission-presentation';

export type HeroDetailTab = 'overview' | 'powers' | 'missions' | 'edit';

const DETAIL_TABS: readonly HeroDetailTab[] = ['overview', 'powers', 'missions', 'edit'];

export interface DossierRow {
  readonly label: string;
  readonly value: string;
}

/** Example ability badges per power class. Illustrative only. */
const EXAMPLE_ABILITIES: Readonly<Record<HeroPowerClass, readonly string[]>> = {
  Aerial: ['Flight', 'Aerial recon', 'Extraction'],
  Energy: ['Directed energy', 'Area projection', 'Overload'],
  Psionic: ['Telepathic link', 'Emotional dampening'],
  Tech: ['Drone control', 'Field gadgets', 'Systems hacking'],
  Mutant: ['Inherited trait', 'Field resistance'],
  Cosmic: ['Spatial warp', 'Gravity anchor'],
  Enhanced: ['Super strength', 'Durability', 'Reflex boost'],
};

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly rosterRoute = '/roster';

  /** The route id. toSignal, not a snapshot: the router reuses this screen when only the id changes. */
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.heroId()));

  readonly activeTab = signal<HeroDetailTab>('overview');

  /** One line of feedback after an action, empty when there is nothing to report. */
  readonly notice = signal('');

  readonly initials = computed(() => monogramOf(this.hero()?.name ?? ''));

  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  /** Every mission this hero has been on, live or closed, from the shared mission state. */
  readonly missions = computed(() => this.missionService.byHero(this.heroId()));

  readonly abilities = computed<readonly string[]>(() => {
    const hero = this.hero();
    return hero ? EXAMPLE_ABILITIES[hero.powerClass] : [];
  });

  readonly dossier = computed<readonly DossierRow[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    return [
      { label: 'Codename', value: hero.name },
      { label: 'Civilian alias', value: hero.alias || 'Unknown' },
      { label: 'Power class', value: hero.powerClass },
      { label: 'Status', value: hero.status },
      { label: 'Clearance', value: hero.clearance },
      { label: 'On active roster', value: hero.active ? 'Yes' : 'No' },
    ];
  });

  readonly statusVariant = heroStatusVariant;

  readonly classVariant = heroPowerClassVariant;

  readonly missionLabel = missionLabel;

  readonly missionVariant = missionVariant;

  /** Tab activation from hlm-tabs. Ignores anything that is not one of the four panels. */
  selectTab(value: string): void {
    const tab = DETAIL_TABS.find((candidate) => candidate === value);
    if (tab) this.activeTab.set(tab);
  }

  /** Opens a live mission for this hero. It appears on the dashboard and the missions board at once. */
  deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) return;
    const mission = this.missionService.launch(hero.id, `Rapid response: ${hero.name}`);
    this.notice.set(`${mission.operation} is live with ${hero.name}.`);
  }

  save(model: HeroFormModel): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.update(hero.id, model);
    this.notice.set(`Changes saved for ${model.name}.`);
    this.activeTab.set('overview');
  }

  /** Leaving the Edit tab discards unsaved changes: the form is only mounted while that tab is open. */
  cancelEdit(): void {
    this.activeTab.set('overview');
  }

  /** Navigates back to the roster first, so the screen does not flash "not found" before it leaves. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    void this.router.navigateByUrl(this.rosterRoute);
    this.heroService.remove(hero.id);
  }
}
