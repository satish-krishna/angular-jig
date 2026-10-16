import { Service, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './example-missions';
import type { Mission } from './mission';

/** Operation codes count up from here, so a new deployment never reuses an example code. */
const FIRST_OPERATION = 2200;

/**
 * In-memory mission log backed by signals. EXAMPLE DATA: there is no backend, so
 * deployments last only until the page reloads.
 */
@Service()
export class MissionService {
  private readonly log = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  /** Every mission on record, newest first, read-only to callers. */
  readonly missions = this.log.asReadonly();

  /** The missions a hero took part in. Reactive when called inside a computed(). */
  forHero(heroId: string): readonly Mission[] {
    return this.log().filter((mission) => mission.heroIds.includes(heroId));
  }

  /** Logs a routine deployment for a hero, In progress, and returns it. */
  deploy(heroId: string): Mission {
    const mission: Mission = {
      id: this.nextId(),
      title: 'Routine deployment',
      threatTier: 1,
      heroIds: [heroId],
      outcome: 'In progress',
    };
    this.log.update((missions) => [mission, ...missions]);
    return mission;
  }

  /** One above the highest operation code on record, never below the first example code. */
  private nextId(): string {
    const highest = this.log().reduce(
      (max, mission) => Math.max(max, Number(mission.id.slice(3)) || 0),
      FIRST_OPERATION,
    );
    return `OP-${highest + 1}`;
  }
}
