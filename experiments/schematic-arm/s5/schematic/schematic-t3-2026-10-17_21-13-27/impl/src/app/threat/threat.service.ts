import { Service, computed, signal } from '@angular/core';
import { EXAMPLE_THREATS } from './threat-example-data';
import type { Threat, ThreatStatus } from './threat.model';

/** Shared threat register. The dashboard's open-threat count reads the same signal the threats screen writes. */
@Service()
export class ThreatService {
  private readonly _threats = signal<Threat[]>(EXAMPLE_THREATS);

  readonly threats = this._threats.asReadonly();
  readonly open = computed(() => this.countWith('Open'));
  readonly contained = computed(() => this.countWith('Contained'));

  setStatus(id: string, status: ThreatStatus): void {
    this._threats.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  private countWith(status: ThreatStatus): number {
    return this._threats().filter((item) => item.status === status).length;
  }
}
