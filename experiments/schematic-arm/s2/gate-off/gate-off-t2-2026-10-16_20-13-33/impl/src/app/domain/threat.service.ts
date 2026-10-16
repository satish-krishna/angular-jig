import { Service } from '@angular/core';
import { EXAMPLE_THREATS } from './example-threats';
import type { Threat } from './threat.model';

/**
 * The threat register. Read-only: threats are seeded from EXAMPLE DATA in `example-threats.ts`
 * and nothing in the console changes them.
 */
@Service()
export class ThreatService {
  readonly threats: readonly Threat[] = EXAMPLE_THREATS;

  /** Look up one threat by id. Returns `undefined` when no threat has that id. */
  byId(id: string): Threat | undefined {
    return this.threats.find((threat) => threat.id === id);
  }
}
