import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { MissionService } from '../mission/mission.service';
import { missionLabel, missionVariant } from '../mission/mission-presentation';

/** Live missions first, then closed ones, each in the order they were launched. */
@Injectable()
export class MissionsViewModel {
  private readonly missionService = inject(MissionService);
  private readonly heroService = inject(HeroService);

  readonly missions = computed(() =>
    [...this.missionService.missions()].sort(
      (a, b) => Number(b.status === 'Live') - Number(a.status === 'Live'),
    ),
  );

  readonly liveCount = computed(() => this.missionService.live().length);

  readonly missionLabel = missionLabel;

  readonly missionVariant = missionVariant;

  /** Names the heroes on a mission. An id whose hero has been retired reads as unknown, not blank. */
  readonly heroNames = (heroIds: readonly string[]): string =>
    heroIds.map((id) => this.heroService.byId(id)?.name ?? 'Retired hero').join(', ');

  complete(id: string): void {
    this.missionService.close(id, 'Success');
  }

  abort(id: string): void {
    this.missionService.close(id, 'Aborted');
  }
}
