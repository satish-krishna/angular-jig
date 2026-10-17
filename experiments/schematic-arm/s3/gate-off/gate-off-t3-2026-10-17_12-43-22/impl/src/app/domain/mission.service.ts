import { inject, Service, signal } from '@angular/core';
import type { Hero } from './hero.model';
import { HeroService } from './hero.service';
import { EXAMPLE_MISSIONS } from './mission.example-data';
import { isOpenMission, type Mission, type MissionOutcome } from './mission.model';
import { nextId } from './next-id';

const CODENAMES = ['Copper Sky', 'Low Tide', 'Glass Harbor', 'Hollow Pine', 'Amber Gate', 'Night Crane'];
const DEPLOY_TIER = 3;

// In-memory store over example data, like HeroService. Settling a mission writes its result into the hero's record.
@Service()
export class MissionService {
  private readonly heroes = inject(HeroService);

  private readonly _missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  readonly missions = this._missions.asReadonly();

  deploy(hero: Hero): Mission {
    const existing = this._missions();
    const mission: Mission = {
      id: nextId('MSN', existing.map((item) => item.id)),
      codename: CODENAMES[existing.length % CODENAMES.length],
      heroId: hero.id,
      threatTier: DEPLOY_TIER,
      status: 'Planned',
      location: 'To be assigned',
    };
    this._missions.update((missions) => [...missions, mission]);
    return mission;
  }

  // A settled mission stays settled: only an open one can take a result.
  resolve(id: string, outcome: MissionOutcome): void {
    const mission = this._missions().find((item) => item.id === id);
    if (!mission || !isOpenMission(mission)) {
      return;
    }
    this._missions.update((missions) =>
      missions.map((item) => (item.id === id ? { ...item, status: outcome } : item)),
    );
    this.heroes.recordMission(mission.heroId, outcome === 'Complete');
  }

  reset(): void {
    this._missions.set(EXAMPLE_MISSIONS);
  }
}
