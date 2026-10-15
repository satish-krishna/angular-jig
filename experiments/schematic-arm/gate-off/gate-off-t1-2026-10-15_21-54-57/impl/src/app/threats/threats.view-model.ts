import { Injectable, computed, inject } from '@angular/core';
import type { Threat, ThreatStatus } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';
import type { StatusBadge } from '../ui/hero-format';

/** Badge variant per threat status. Open is the one that needs attention. */
const THREAT_STATUS_BADGE: Record<ThreatStatus, StatusBadge> = {
  Open: 'destructive',
  Contained: 'warning',
  Resolved: 'success',
};

/** A threat as one board card: the record plus the display values the card needs. */
export interface ThreatRow extends Threat {
  readonly statusVariant: StatusBadge;
}

// Owns the threat board's derived rows and counts. Component-scoped (provided by Threats), so no providedIn.
@Injectable()
export class ThreatsViewModel {
  private readonly threats = inject(ThreatService);

  readonly total = this.threats.count;
  readonly openCount = this.threats.openCount;

  /** Every threat, highest tier first. */
  readonly rows = computed<readonly ThreatRow[]>(() =>
    [...this.threats.list()]
      .sort((a, b) => b.tier - a.tier || a.id.localeCompare(b.id))
      .map((threat) => ({ ...threat, statusVariant: THREAT_STATUS_BADGE[threat.status] })),
  );
}
