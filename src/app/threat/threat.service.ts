import { Injectable, signal } from '@angular/core';
import type { Threat } from './threat.model';
import type { ThreatFormModel } from './threat.schema';
import { EXAMPLE_THREATS } from './threat-example-data';

@Injectable({ providedIn: 'root' })
export class ThreatService {
  private readonly _threats = signal<Threat[]>(EXAMPLE_THREATS);
  private readonly _nextId = signal(Math.max(...EXAMPLE_THREATS.map((t) => parseInt(t.id, 10))) + 1);

  readonly threats = this._threats.asReadonly();

  byId(id: string): Threat | undefined {
    return this._threats().find((t) => t.id === id);
  }

  create(candidate: ThreatFormModel): Threat {
    const threat: Threat = { id: String(this._nextId()), ...candidate };
    this._threats.update((list) => [...list, threat]);
    this._nextId.update((n) => n + 1);
    return threat;
  }

  update(id: string, patch: Partial<ThreatFormModel>): void {
    this._threats.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  remove(id: string): void {
    this._threats.update((list) => list.filter((t) => t.id !== id));
  }
}
