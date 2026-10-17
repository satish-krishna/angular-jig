import { Injectable, computed, inject } from '@angular/core';
import { heroStatusVariant } from '../ops/badges';
import { HeroService } from '../hero/hero.service';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';

// How many heroes the "top heroes this cycle" grid shows: one full row at the widest breakpoint.
const TOP_HERO_COUNT = 4;

// Component-scoped (no providedIn): the dashboard provides it, so each visit gets a fresh one.
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);
  private readonly heroes = this.heroService.heroes;

  readonly rosterCount = computed(() => this.heroes().length);

  readonly liveMissions = this.missionService.live;

  // A threat stops being open once it is contained; engaged threats still need attention.
  readonly openThreats = computed(
    () => this.threatService.threats().filter((threat) => threat.status !== 'Contained').length,
  );

  readonly averagePower = computed(() => {
    const powers = this.heroes().map((hero) => hero.power);
    if (powers.length === 0) return 0;
    return Math.round(powers.reduce((sum, power) => sum + power, 0) / powers.length);
  });

  /** The full roster in the same order the roster screen uses. */
  readonly roster = computed(() => [...this.heroes()].sort((a, b) => b.power - a.power));

  readonly topHeroes = computed(() => this.roster().slice(0, TOP_HERO_COUNT));

  readonly statusVariant = heroStatusVariant;
}
