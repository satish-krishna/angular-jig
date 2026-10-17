import { Injectable, computed, inject, signal } from '@angular/core';
import { ThreatService } from '../threat/threat.service';
import type { Mission, MissionRecord } from './mission.model';
import { EXAMPLE_MISSIONS } from './mission-example-data';

// The current cycle is the newest one in the example data; a deployment launches into it.
const CURRENT_CYCLE = Math.max(...EXAMPLE_MISSIONS.map((item) => item.cycle));

@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly threats = inject(ThreatService);
  private readonly _missions = signal<Mission[]>(EXAMPLE_MISSIONS);
  private readonly _nextId = signal(
    Math.max(0, ...EXAMPLE_MISSIONS.map((item) => parseInt(item.id.slice(2), 10))) + 1,
  );

  readonly missions = this._missions.asReadonly();

  readonly live = computed(() => this._missions().filter((item) => item.outcome === 'Active').length);

  /** Every mission with its threat resolved, oldest first. Retired heroes keep their history. */
  readonly records = computed<MissionRecord[]>(() =>
    this._missions().map((mission) => {
      const threat = this.threats.byId(mission.threatId);
      return {
        ...mission,
        threatName: threat?.name ?? 'Unknown threat',
        tier: threat?.tier ?? 1,
      };
    }),
  );

  forHero(heroId: string): MissionRecord[] {
    return this.records().filter((item) => item.heroId === heroId);
  }

  /** Engages the threat and launches a live mission against it. */
  deploy(heroId: string, threatId: string): Mission {
    const mission: Mission = {
      id: `M-${this._nextId()}`,
      heroId,
      threatId,
      outcome: 'Active',
      cycle: CURRENT_CYCLE,
    };
    this.threats.setStatus(threatId, 'Engaged');
    this._missions.update((items) => [...items, mission]);
    this._nextId.update((n) => n + 1);
    return mission;
  }

  /** Closes a live mission as a success, which contains its threat. */
  complete(missionId: string): void {
    const mission = this._missions().find((item) => item.id === missionId);
    if (!mission) return;
    this._missions.update((items) =>
      items.map((item) => (item.id === missionId ? { ...item, outcome: 'Success' } : item)),
    );
    this.threats.setStatus(mission.threatId, 'Contained');
  }

  /** Contains a threat directly. Any live mission against it closes as a success. */
  contain(threatId: string): void {
    this._missions.update((items) =>
      items.map((item) =>
        item.threatId === threatId && item.outcome === 'Active' ? { ...item, outcome: 'Success' } : item,
      ),
    );
    this.threats.setStatus(threatId, 'Contained');
  }
}
