import { Service, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './threat.example-data';
import type { Threat } from './threat.model';

/**
 * The threat register as in-memory signal state. There is no backend: the register is
 * EXAMPLE DATA and resets on every page load.
 */
@Service()
export class ThreatService {
  private readonly threats = signal<readonly Threat[]>(EXAMPLE_THREATS);

  /** The register, in the order it was seeded. */
  readonly register = this.threats.asReadonly();
}
