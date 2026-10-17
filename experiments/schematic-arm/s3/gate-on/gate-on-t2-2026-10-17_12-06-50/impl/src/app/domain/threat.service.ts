import { Injectable } from '@angular/core';
import { EXAMPLE_THREATS } from './threat.example-data';
import type { Threat } from './threat.model';

/**
 * The threat board. Threats are reference data in this console: they are read, not edited,
 * so the list is a plain array rather than a signal.
 */
@Injectable({ providedIn: 'root' })
export class ThreatService {
  public readonly threats: readonly Threat[] = EXAMPLE_THREATS;

  public byId(id: string): Threat | undefined {
    return this.threats.find((threat) => threat.id === id);
  }
}
