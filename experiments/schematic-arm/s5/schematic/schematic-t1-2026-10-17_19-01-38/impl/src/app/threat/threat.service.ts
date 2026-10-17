import { Injectable, signal } from '@angular/core';
import type { Threat, ThreatStatus } from './threat.model';
import { EXAMPLE_THREATS } from './threat-example-data';

@Injectable({ providedIn: 'root' })
export class ThreatService {
  private readonly _threats = signal<Threat[]>(EXAMPLE_THREATS);

  readonly threats = this._threats.asReadonly();

  byId(id: string): Threat | undefined {
    return this._threats().find((item) => item.id === id);
  }

  setStatus(id: string, status: ThreatStatus): void {
    this._threats.update((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }
}
