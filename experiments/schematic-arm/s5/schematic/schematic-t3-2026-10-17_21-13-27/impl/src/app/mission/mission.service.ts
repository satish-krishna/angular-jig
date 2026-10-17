import { Service, computed, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './mission-example-data';
import type { Mission, MissionOutcome } from './mission.model';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Shared mission state. The detail, dashboard and missions screens all read this one signal. */
@Service()
export class MissionService {
  private readonly _missions = signal<Mission[]>(EXAMPLE_MISSIONS);
  private nextId = EXAMPLE_MISSIONS.length + 1;

  readonly missions = this._missions.asReadonly();
  readonly live = computed(() => this._missions().filter((mission) => mission.status === 'Live'));

  byHero(heroId: string): Mission[] {
    return this._missions().filter((mission) => mission.heroIds.includes(heroId));
  }

  /** Opens a live mission for one hero. The operation name is a placeholder until a planner names it. */
  launch(heroId: string, operation: string): Mission {
    const now = new Date();
    const mission: Mission = {
      id: `m${this.nextId}`,
      operation,
      heroIds: [heroId],
      launched: `${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      status: 'Live',
      outcome: null,
    };
    this.nextId += 1;
    this._missions.update((items) => [...items, mission]);
    return mission;
  }

  close(id: string, outcome: MissionOutcome): void {
    this._missions.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status: 'Closed', outcome } : item)),
    );
  }
}
