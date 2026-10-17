import { computed, inject, Injectable } from '@angular/core';
import { MissionService } from '../domain/mission.service';

/** Component-scoped ViewModel for the Missions screen: the mission log and its summary figures. */
@Injectable()
export class MissionsViewModel {
  private readonly _missions = inject(MissionService);

  /** Every mission, newest first. */
  readonly missions = this._missions.board;

  readonly total = computed(() => this.missions().length);

  readonly inProgress = computed(() => this.missions().filter((mission) => mission.outcome === 'In progress').length);

  /** Partial or failed missions, which need a follow-up. */
  readonly needsAttention = computed(
    () => this.missions().filter((mission) => mission.outcome === 'Partial' || mission.outcome === 'Failed').length,
  );
}
