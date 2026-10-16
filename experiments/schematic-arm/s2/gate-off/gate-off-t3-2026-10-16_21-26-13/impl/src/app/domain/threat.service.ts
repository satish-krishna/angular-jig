import { Service, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './example-threats';

/** Read-only threat register. Seeded from EXAMPLE_THREATS, which is example data. */
@Service()
export class ThreatService {
  readonly threats = signal(EXAMPLE_THREATS).asReadonly();
}
