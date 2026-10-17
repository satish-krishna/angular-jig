import { Service, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './example-threats';

/**
 * The threat board as in-memory state. Read-only in this console: the threats are
 * EXAMPLE DATA and no screen changes them. Singleton, so every ViewModel reads the same board.
 */
@Service()
export class ThreatService {
  readonly threats = signal(EXAMPLE_THREATS).asReadonly();
}
