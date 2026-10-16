import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero.model';
import type { Mission } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { OUTCOME_BADGE, type BadgeVariant } from '../ui/hero-badges';

export interface MissionRow {
  readonly mission: Mission;
  /** The hero the deployment names, or undefined once that hero has been retired. */
  readonly hero: Hero | undefined;
  readonly outcomeVariant: BadgeVariant;
}

@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  /** Every deployment, most recent first. Reverses a copy, so the shared record is untouched. */
  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.missionService.missions()].reverse().map((mission) => ({
      mission,
      hero: this.heroService.find(mission.heroId),
      outcomeVariant: OUTCOME_BADGE[mission.outcome],
    })),
  );

  private readonly completed = computed(() =>
    this.missionService.missions().filter((mission) => mission.outcome !== 'In progress'),
  );

  readonly liveLabel = computed(() =>
    String(this.missionService.missions().filter((mission) => mission.outcome === 'In progress').length),
  );

  readonly completedLabel = computed(() => String(this.completed().length));

  /** Share of completed missions that succeeded in full. A dash until there is a completed mission to judge. */
  readonly successLabel = computed(() => {
    const done = this.completed();
    if (done.length === 0) return '—';
    const wins = done.filter((mission) => mission.outcome === 'Success').length;
    return `${Math.round((wins / done.length) * 100)}%`;
  });
}
