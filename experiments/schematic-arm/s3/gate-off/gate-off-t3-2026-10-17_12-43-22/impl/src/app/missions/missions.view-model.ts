import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { isOpenMission, type Mission, type MissionOutcome } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';

export interface MissionRow {
  readonly mission: Mission;
  readonly heroName: string;
  readonly open: boolean;
}

// Component-scoped: the missions screen provides it, so each visit reads the live log.
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missionLog = inject(MissionService);

  private readonly heroNames = computed(
    () => new Map(this.heroes.heroes().map((hero) => [hero.id, hero.name] as const)),
  );

  // Open missions first, then the highest threat tier first.
  public readonly rows = computed<MissionRow[]>(() => {
    const names = this.heroNames();
    return [...this.missionLog.missions()]
      .sort((a, b) => Number(isOpenMission(b)) - Number(isOpenMission(a)) || b.threatTier - a.threatTier)
      .map((mission) => ({
        mission,
        heroName: names.get(mission.heroId) ?? 'Not on roster',
        open: isOpenMission(mission),
      }));
  });

  public readonly openCount = computed(() => this.rows().filter((row) => row.open).length);

  public resolve(id: string, outcome: MissionOutcome): void {
    this.missionLog.resolve(id, outcome);
  }
}
