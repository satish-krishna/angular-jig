import { computed, Service, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './threat.example-threats';
import type { Threat } from './threat.model';

/**
 * The threat board, held as in-memory signal state. EXAMPLE DATA: containing a threat
 * lasts only until the page reloads.
 */
@Service()
export class ThreatService {
  private readonly threats = signal<readonly Threat[]>(EXAMPLE_THREATS);

  /** Every threat, read-only to consumers. */
  readonly all = this.threats.asReadonly();

  /** How many threats are still open. */
  readonly openCount = computed(() => this.threats().filter((threat) => threat.status === 'Open').length);

  /** Mark one threat contained. Unknown ids are a no-op. */
  contain(id: string): void {
    this.threats.update((list) =>
      list.map((threat) => (threat.id === id ? { ...threat, status: 'Contained' as const } : threat)),
    );
  }
}
