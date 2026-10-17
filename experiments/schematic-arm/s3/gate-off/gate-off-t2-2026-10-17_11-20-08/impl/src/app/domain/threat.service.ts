import { computed, Service, signal } from '@angular/core';
import type { Threat } from './threat.model';
import { EXAMPLE_THREATS } from './operations.seed';

/** Threats on the board. EXAMPLE DATA ONLY: the list is read-only and the app never changes it. */
@Service()
export class ThreatService {
  readonly threats = signal<readonly Threat[]>(EXAMPLE_THREATS).asReadonly();

  readonly openCount = computed(() => this.threats().filter((threat) => threat.status === 'Open').length);

  findById(id: string): Threat | undefined {
    return this.threats().find((threat) => threat.id === id);
  }
}
