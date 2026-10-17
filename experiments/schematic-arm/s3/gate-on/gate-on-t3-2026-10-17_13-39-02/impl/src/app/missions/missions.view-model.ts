import { computed, inject, Injectable } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { HeroService } from '../domain/hero.service';
import type { Mission, MissionStatus } from '../domain/mission';
import { MissionService } from '../domain/mission.service';
import { missionVariantOf } from '../ui/hero-display';

// Live missions list first, then the rest by launch order, newest first.
const STATUS_ORDER: Readonly<Record<MissionStatus, number>> = { Live: 0, Succeeded: 1, Failed: 2 };

// One log row: the mission plus the presentation the table needs, so the template reads no logic.
export interface MissionRow {
  readonly mission: Mission;
  readonly heroName: string;
  readonly link: readonly string[];
  readonly variant: BadgeVariants['variant'];
}

// Missions state: outcome counts for the stat tiles and the mission log rows. Component-scoped, provided by Missions.
@Injectable()
export class MissionsViewModel {
  private readonly missionService = inject(MissionService);
  private readonly heroService = inject(HeroService);

  readonly liveCount = computed(() => this.countOf('Live'));
  readonly succeededCount = computed(() => this.countOf('Succeeded'));
  readonly failedCount = computed(() => this.countOf('Failed'));
  readonly successRate = computed(() => {
    const closed = this.succeededCount() + this.failedCount();
    return closed === 0 ? 0 : Math.round((this.succeededCount() * 100) / closed);
  });

  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.missionService.missions()]
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.id.localeCompare(a.id))
      .map((mission) => ({
        mission,
        heroName: this.heroService.findById(mission.heroId)?.name ?? mission.heroId,
        link: ['/detail', mission.heroId],
        variant: missionVariantOf(mission.status),
      })),
  );

  private countOf(status: MissionStatus): number {
    return this.missionService.missions().filter((mission) => mission.status === status).length;
  }
}
