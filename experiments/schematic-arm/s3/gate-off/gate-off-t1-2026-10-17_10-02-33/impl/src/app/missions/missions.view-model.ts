import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { missionLine, type MissionLine } from '../ui/mission-status';

export interface MissionEntry extends MissionLine {
  // Null when the hero is no longer on the roster, so the row can say so without a dead link.
  readonly heroName: string | null;
}

// The missions screen's view of the shared deployments, with no DOM. Component-scoped: the Missions component provides it.
@Injectable()
export class MissionsViewModel {
  private readonly missionService = inject(MissionService);
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  // Deploying opens this screen with ?hero=. The filter follows the URL, not a snapshot, so a second deploy re-filters.
  private readonly heroId = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('hero'))),
    { initialValue: this.route.snapshot.queryParamMap.get('hero') },
  );

  readonly filterName = computed(() => {
    const id = this.heroId();
    return id ? (this.heroService.byId(id)?.name ?? 'a hero no longer on the roster') : null;
  });

  // Newest first.
  readonly entries = computed<readonly MissionEntry[]>(() => {
    const heroId = this.heroId();
    return this.missionService
      .all()
      .filter((mission) => !heroId || mission.heroId === heroId)
      .map((mission) => ({
        ...missionLine(mission),
        heroName: this.heroService.byId(mission.heroId)?.name ?? null,
      }))
      .reverse();
  });

  readonly summary = computed(() => {
    const entries = this.entries();
    const count = (status: MissionEntry['status']) => entries.filter((entry) => entry.status === status).length;
    return `${count('Live')} live, ${count('Won')} won, ${count('Lost')} lost`;
  });
}
