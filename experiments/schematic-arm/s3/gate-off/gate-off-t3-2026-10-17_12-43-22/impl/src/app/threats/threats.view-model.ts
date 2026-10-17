import { computed, inject, Injectable } from '@angular/core';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { isOpenMission, type Mission } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';

export interface ThreatRow {
  readonly mission: Mission;
  readonly heroName: string;
}

// Component-scoped: the threats screen provides it, so each visit reads the live roster and log.
@Injectable()
export class ThreatsViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missionLog = inject(MissionService);

  // Heroes who cannot take the field right now.
  public readonly atRisk = computed<Hero[]>(() =>
    this.heroes.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA'),
  );

  // Live missions, highest threat tier first.
  public readonly openThreats = computed<ThreatRow[]>(() => {
    const names = new Map(this.heroes.heroes().map((hero) => [hero.id, hero.name] as const));
    return this.missionLog
      .missions()
      .filter(isOpenMission)
      .sort((a, b) => b.threatTier - a.threatTier)
      .map((mission) => ({ mission, heroName: names.get(mission.heroId) ?? 'Not on roster' }));
  });
}
