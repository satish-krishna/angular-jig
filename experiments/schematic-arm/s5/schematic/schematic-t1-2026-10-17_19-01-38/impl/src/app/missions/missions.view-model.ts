import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { MissionService } from '../mission/mission.service';
import { missionOutcomeVariant } from '../ops/badges';

// Component-scoped (no providedIn): the missions screen provides it.
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  readonly live = this.missionService.live;

  // Newest first: the service keeps missions oldest first, as they were logged.
  readonly rows = computed(() =>
    [...this.missionService.records()].reverse().map((mission) => ({
      ...mission,
      heroName: this.heroService.byId(mission.heroId)?.name ?? 'Retired hero',
    })),
  );

  readonly outcomeVariant = missionOutcomeVariant;

  complete(missionId: string): void {
    this.missionService.complete(missionId);
  }
}
