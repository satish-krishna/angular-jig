import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import type { Hero } from '../domain/hero.model';
import { STATUS_BADGE, type StatusBadge } from '../ui/hero-presentation';
import type { StatIcon } from '../ui/stat-tile';

const TOP_HERO_COUNT = 4;
const ROSTER_PREVIEW_COUNT = 6;

export interface DashboardStat {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly icon: StatIcon;
}

export interface RosterPreviewRow {
  readonly hero: Hero;
  readonly statusBadge: StatusBadge;
}

// The dashboard's state and logic, no DOM. Component-scoped (no providedIn): the
// Dashboard component provides it, so each visit to the screen gets fresh state.
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService).heroes;
  private readonly missions = inject(MissionService);

  readonly rosterCount = computed(() => this.heroes().length);

  private readonly activeCount = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);
  private readonly attentionCount = computed(
    () => this.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );
  private readonly averagePower = computed(() => {
    const count = this.rosterCount();
    if (count === 0) {
      return 0;
    }
    return Math.round(this.heroes().reduce((sum, hero) => sum + hero.powerIndex, 0) / count);
  });

  // The strongest heroes on the roster, shared by the top-heroes cards and the roster table.
  private readonly byPower = computed(() => [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex));

  // Example data has no cycle log, so "this cycle" means the strongest heroes on the roster.
  readonly topHeroes = computed(() => this.byPower().slice(0, TOP_HERO_COUNT));

  readonly rosterPreview = computed<readonly RosterPreviewRow[]>(() =>
    this.byPower()
      .slice(0, ROSTER_PREVIEW_COUNT)
      .map((hero) => ({ hero, statusBadge: STATUS_BADGE[hero.status] })),
  );

  readonly stats = computed<readonly DashboardStat[]>(() => [
    { key: 'heroes', label: 'Heroes on the books', value: this.rosterCount(), hint: `${this.activeCount()} active`, icon: 'lucideUserCheck' },
    { key: 'missions', label: 'Missions live', value: this.missions.liveCount(), hint: `${this.missions.missions().length} logged in total`, icon: 'lucideActivity' },
    { key: 'power', label: 'Average power', value: this.averagePower(), hint: 'Power index, 0 to 100', icon: 'lucideZap' },
    { key: 'attention', label: 'Needs attention', value: this.attentionCount(), hint: 'Injured or MIA', icon: 'lucideShieldAlert' },
  ]);
}
