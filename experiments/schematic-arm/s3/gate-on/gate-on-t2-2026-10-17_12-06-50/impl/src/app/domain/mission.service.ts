import { Injectable, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './mission.example-data';
import type { Mission } from './mission.model';

/**
 * In-memory deployment log. Like the roster it is EXAMPLE DATA plus whatever the user
 * deploys during this visit, and nothing is persisted.
 */
@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly _missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  public readonly missions = this._missions.asReadonly();

  /** Logs a new deployment in progress, launched today, and returns it. */
  public deploy(heroId: string, threatId: string): Mission {
    const mission: Mission = {
      id: this._nextId(),
      heroId,
      threatId,
      outcome: 'In progress',
      launched: new Date().toISOString().slice(0, 10),
    };
    this._missions.update((missions) => [...missions, mission]);
    return mission;
  }

  /** Puts the example log back, discarding deployments made during this visit. */
  public restore(): void {
    this._missions.set(EXAMPLE_MISSIONS);
  }

  private _nextId(): string {
    const taken = new Set(this._missions().map((mission) => mission.id));
    let n = this._missions().length + 1;
    while (taken.has(this._format(n))) n++;
    return this._format(n);
  }

  private _format(n: number): string {
    return `MIS-${String(n).padStart(3, '0')}`;
  }
}
