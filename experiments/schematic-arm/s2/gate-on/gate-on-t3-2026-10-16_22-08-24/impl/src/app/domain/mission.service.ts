import { Service, signal } from '@angular/core';
import { EXAMPLE_MISSIONS, FIRST_MISSION_NUMBER } from './mission.data';
import type { Mission } from './mission.model';

/**
 * The deployment record. Like the roster it is an in-memory signal seeded with
 * example data. Deploying a hero from the detail screen files a mission here,
 * so the Missions screen and the hero's own record both read the same list.
 */
@Service()
export class MissionService {
  private readonly log = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  private nextNumber = FIRST_MISSION_NUMBER;

  /** Every mission, oldest first, read-only. */
  readonly missions = this.log.asReadonly();

  /** One hero's missions, newest first. */
  forHero(heroId: string): readonly Mission[] {
    return this.log().filter((mission) => mission.heroId === heroId).reverse();
  }

  /** File an open deployment order for a hero and return it. It stays in progress until briefed. */
  file(heroId: string): Mission {
    const mission: Mission = {
      id: `MS-${this.nextNumber}`,
      heroId,
      target: 'Open tasking, awaiting briefing',
      outcome: 'In progress',
    };
    this.nextNumber += 1;
    this.log.update((missions) => [...missions, mission]);
    return mission;
  }

  /** Put the record back to the example data. */
  reset(): void {
    this.log.set(EXAMPLE_MISSIONS);
    this.nextNumber = FIRST_MISSION_NUMBER;
  }
}
