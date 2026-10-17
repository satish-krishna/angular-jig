import { computed, Service, signal } from '@angular/core';
import type { Mission, MissionStatus } from './mission.model';
import { EXAMPLE_MISSIONS } from './operations.seed';

/**
 * The deployment log. EXAMPLE DATA ONLY: there is no backend, so deployments and results
 * live in signal state and are lost on reload.
 */
@Service()
export class MissionService {
  private readonly state = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  readonly missions = this.state.asReadonly();

  readonly liveCount = computed(() => this.state().filter((mission) => mission.status === 'Live').length);

  /** One hero's deployments, in log order (newest first). */
  forHero(heroId: string): readonly Mission[] {
    return this.state().filter((mission) => mission.heroId === heroId);
  }

  /** Launches a live mission at the top of the log. */
  deploy(heroId: string, threatId: string): Mission {
    const highest = Math.max(0, ...this.state().map((mission) => Number(mission.id.slice('MSN-'.length))));
    const mission: Mission = { id: `MSN-${String(highest + 1).padStart(4, '0')}`, heroId, threatId, status: 'Live' };
    this.state.update((missions) => [mission, ...missions]);
    return mission;
  }

  /** Records the result of one mission. Every other mission is left as it is. */
  resolve(id: string, status: Exclude<MissionStatus, 'Live'>): void {
    this.state.update((missions) => missions.map((mission) => (mission.id === id ? { ...mission, status } : mission)));
  }

  reset(): void {
    this.state.set(EXAMPLE_MISSIONS);
  }
}
