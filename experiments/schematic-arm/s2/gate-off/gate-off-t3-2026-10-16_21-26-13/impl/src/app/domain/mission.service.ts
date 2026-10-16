import { Service, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './example-missions';
import type { Mission } from './mission.model';

/**
 * In-memory mission log. Seeded from EXAMPLE_MISSIONS, which is example data.
 * Deployments are written here and read back by the dossier and missions screens.
 */
@Service()
export class MissionService {
  private readonly missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  readonly log = this.missions.asReadonly();

  /** Records a deployment for a hero in the current cycle, with no threat assigned yet. Returns the new mission's id. */
  deploy(heroId: string): string {
    const current = this.missions();
    const cycle = Math.max(0, ...current.map((mission) => mission.cycle));
    const id = nextMissionId(current);
    const mission: Mission = { id, operation: 'Field deployment', heroId, threatId: null, outcome: 'In progress', cycle };
    this.missions.update((list) => [mission, ...list]);
    return id;
  }
}

function nextMissionId(list: readonly Mission[]): string {
  const highest = Math.max(0, ...list.map((mission) => Number.parseInt(mission.id.slice(4), 10) || 0));
  return `MSN-${highest + 1}`;
}
