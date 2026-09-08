import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);

  readonly heroes = this.heroService.heroes;

  readonly totalHeroes = computed(() => this.heroes().length);

  readonly activeMissions = computed(
    () => this.missionService.missions().filter((m) => m.status === 'Active').length,
  );

  readonly threats = computed(
    () => this.threatService.threats().filter((t) => t.status === 'Active').length,
  );

  readonly averagePower = computed(() => {
    const heroes = this.heroes();
    return heroes.length ? Math.round(heroes.reduce((sum, h) => sum + h.power, 0) / heroes.length) : 0;
  });

  readonly topHeroes = computed(() =>
    this.heroes()
      .slice()
      .sort((a, b) => b.power - a.power)
      .slice(0, 4),
  );
}
