import { Service, signal } from '@angular/core';
import { CURRENT_CYCLE, EXAMPLE_MISSIONS } from './example-missions';
import type { Mission } from './mission';

/**
 * The mission log as in-memory signal state. EXAMPLE DATA, like the roster: nothing is
 * persisted and every launch lasts until a reload. Singleton, so the detail screen's
 * Deploy action shows up on the Missions screen.
 */
@Service()
export class MissionService {
  private readonly state = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  readonly missions = this.state.asReadonly();

  /** Logs a live deployment for a hero in the current cycle, and returns it. */
  launch(heroId: string): Mission {
    const mission: Mission = {
      id: this.nextId(),
      codename: 'Rapid deployment',
      heroId,
      status: 'Live',
      threatTier: 1,
      cycle: CURRENT_CYCLE,
    };
    this.state.update((missions) => [...missions, mission]);
    return mission;
  }

  /** Puts the example mission log back. */
  reset(): void {
    this.state.set(EXAMPLE_MISSIONS);
  }

  // Ids follow MSN-NNNN, one past the highest number in the log.
  private nextId(): string {
    const highest = this.state().reduce((max, mission) => Math.max(max, Number(mission.id.slice(4))), 0);
    return `MSN-${String(highest + 1).padStart(4, '0')}`;
  }
}
