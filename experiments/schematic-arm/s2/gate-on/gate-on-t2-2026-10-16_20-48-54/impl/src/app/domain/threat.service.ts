import { Service, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './example-threats';
import type { Threat } from './threat';

/** The watch list, read-only for now. EXAMPLE DATA: there is no backend behind it. */
@Service()
export class ThreatService {
  private readonly list = signal<readonly Threat[]>(EXAMPLE_THREATS);

  /** Every threat on the watch list. */
  readonly threats = this.list.asReadonly();
}
