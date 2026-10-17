import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';
import { type BadgeVariant, STATUS_BADGE } from '../hero/hero-presentation';

export type HeroDetailTab = 'overview' | 'powers' | 'missions' | 'edit';

const TABS: readonly HeroDetailTab[] = ['overview', 'powers', 'missions', 'edit'];

/** Every piece of copy the detail screen shows. The template binds to these and never repeats them. */
const HERO_DETAIL_TEXT = {
  back: 'Back to roster',
  rosterRoute: '/roster',
  notFound: 'No hero matches this record. It may have been retired.',
  deploy: 'Deploy',
  retire: 'Retire',
  retireTitle: 'Retire this hero?',
  retireDescription:
    'The hero will be removed from the roster. This cannot be undone.',
  retireConfirm: 'Retire hero',
  cancel: 'Cancel',
  sections: 'Hero sections',
  tabs: {
    overview: 'Overview',
    powers: 'Powers',
    missions: 'Missions',
    edit: 'Edit',
  },
  overview: {
    summary: 'Field summary',
    dossier: 'Dossier',
    noNotes: 'No field notes on file.',
    missions: 'Missions',
    missionsHint: 'Logged to date',
    successRate: 'Success rate',
    successHint: 'Across logged missions',
    power: 'Power index',
    powerHint: 'Out of 100',
  },
  powers: {
    meter: 'Power index',
    classification: 'Classification',
  },
  missions: {
    summary: 'Mission record',
    successful: 'Successful',
    unsuccessful: 'Unsuccessful',
    note: 'Per-deployment logs are not in the example data. These totals are derived from the hero record.',
  },
  edit: {
    submit: 'Save changes',
  },
  dossier: {
    codename: 'Codename',
    alias: 'Alter ego',
    heroClass: 'Power class',
    power: 'Power index',
    status: 'Status',
    clearance: 'Clearance tier',
    duty: 'Active duty',
    onDuty: 'On duty',
    offDuty: 'Off duty',
  },
} as const;

export interface DossierRow {
  readonly label: string;
  readonly value: string;
}

export interface MissionRow {
  readonly label: string;
  readonly value: string;
  readonly variant?: BadgeVariant;
}

/**
 * State for one hero's detail screen. Component-scoped: the screen provides it, so each
 * visit gets a fresh view model that follows the route's `:id` rather than a stale snapshot.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly text = HERO_DETAIL_TEXT;

  // The router reuses this component when only the id changes, so the id is read as a
  // stream rather than from a snapshot taken once in ngOnInit.
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.id()));

  readonly activeTab = signal<HeroDetailTab>('overview');

  readonly initials = computed(() => this.hero()?.name.slice(0, 2).toUpperCase() ?? '');

  readonly statusVariant = computed<BadgeVariant>(() => {
    const hero = this.hero();
    return hero ? STATUS_BADGE[hero.status] : 'outline';
  });

  /** Deploy puts a hero on active duty and back to Active status. An injured or missing hero cannot be sent out. */
  readonly canDeploy = computed(() => {
    const hero = this.hero();
    return !!hero && !hero.active && hero.status !== 'Injured' && hero.status !== 'MIA';
  });

  readonly dossier = computed<readonly DossierRow[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    const rows = this.text.dossier;
    return [
      { label: rows.codename, value: hero.name },
      { label: rows.alias, value: hero.alias },
      { label: rows.heroClass, value: hero.heroClass },
      { label: rows.power, value: String(hero.power) },
      { label: rows.status, value: hero.status },
      { label: rows.clearance, value: hero.clearance },
      { label: rows.duty, value: hero.active ? rows.onDuty : rows.offDuty },
    ];
  });

  /** The result totals are derived from the record's missions and success rate, not a deployment log. */
  readonly missionRows = computed<readonly MissionRow[]>(() => {
    const hero = this.hero();
    if (!hero) return [];
    const won = Math.round((hero.missions * hero.successRate) / 100);
    return [
      { label: this.text.overview.missions, value: String(hero.missions) },
      { label: this.text.missions.successful, value: String(won), variant: 'success' },
      { label: this.text.missions.unsuccessful, value: String(hero.missions - won), variant: 'destructive' },
      { label: this.text.overview.successRate, value: `${hero.successRate}%` },
    ];
  });

  selectTab(key: string): void {
    const tab = TABS.find((candidate) => candidate === key);
    if (tab) this.activeTab.set(tab);
  }

  deploy(): void {
    if (!this.canDeploy()) return;
    this.heroService.update(this.id(), { active: true, status: 'Active' });
  }

  retire(): void {
    this.heroService.remove(this.id());
    void this.router.navigateByUrl(this.text.rosterRoute);
  }

  save(model: HeroFormModel): void {
    this.heroService.update(this.id(), model);
    this.activeTab.set('overview');
  }

  cancel(): void {
    this.activeTab.set('overview');
  }
}
