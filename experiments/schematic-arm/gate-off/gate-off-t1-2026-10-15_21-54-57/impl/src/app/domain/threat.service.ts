import { Service, computed, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './threat.example-data';

/**
 * Threat board store. Holds EXAMPLE DATA (see `threat.example-data.ts`) as read-only
 * signal state. The dashboard and the threats screen both read it, so they agree.
 */
@Service()
export class ThreatService {
  private readonly threats = signal(EXAMPLE_THREATS);

  readonly list = this.threats.asReadonly();
  readonly count = computed(() => this.threats().length);
  readonly openCount = computed(() => this.threats().filter((threat) => threat.status === 'Open').length);
}
