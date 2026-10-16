import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import type { Mission } from '../domain/mission';

/** One operation row: the mission plus the codenames of the heroes deployed on it. */
export interface MissionRow {
  readonly mission: Mission;
  readonly heroNames: string;
}

@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);
  private readonly log = inject(MissionService);

  readonly rows = computed<readonly MissionRow[]>(() =>
    this.log.missions().map((mission) => ({
      mission,
      heroNames: mission.heroIds.map((id) => this.heroes.byId(id)?.name ?? id).join(', '),
    })),
  );

  readonly inProgressCount = computed(
    () => this.log.missions().filter((mission) => mission.outcome === 'In progress').length,
  );

  readonly successCount = computed(
    () => this.log.missions().filter((mission) => mission.outcome === 'Success').length,
  );
}
