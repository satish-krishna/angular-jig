import { Service, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './mission.data';
import type { Mission } from './mission.model';

// In-memory deployments, shared by the detail, missions and threats screens. Seeded with EXAMPLE_MISSIONS.
@Service()
export class MissionService {
  private readonly missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);
  readonly all = this.missions.asReadonly();

  forHero(heroId: string): readonly Mission[] {
    return this.missions().filter((mission) => mission.heroId === heroId);
  }

  deploy(heroId: string, threatId: string): Mission {
    const highest = Math.max(0, ...this.missions().map((mission) => Number(mission.id.slice(4))));
    const mission: Mission = { id: `MSN-${String(highest + 1).padStart(4, '0')}`, heroId, threatId, status: 'Live' };
    this.missions.update((missions) => [...missions, mission]);
    return mission;
  }

  reset(): void {
    this.missions.set(EXAMPLE_MISSIONS);
  }
}
