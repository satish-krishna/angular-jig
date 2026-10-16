import { computed, inject, Injectable } from '@angular/core';
import { ThreatService } from '../domain/threat.service';
import type { ClearanceTier } from '../domain/hero';
import type { Threat } from '../domain/threat';

/** The badge variant a threat's status is shown with. */
export type ThreatBadge = 'destructive' | 'secondary' | 'outline';

export interface ThreatRow {
  readonly threat: Threat;
  readonly badge: ThreatBadge;
}

/** Threats at one tier, shown under a single heading. */
export interface ThreatGroup {
  readonly tier: ClearanceTier;
  readonly threats: readonly ThreatRow[];
}

/** Tiers from highest to lowest, so the most serious threats lead the page. */
const TIERS: readonly ClearanceTier[] = [5, 4, 3, 2, 1];

/** Tier 4 and above need senior clearance to respond. */
const SENIOR_TIER = 4;

function badgeFor(status: Threat['status']): ThreatBadge {
  if (status === 'Engaged') return 'destructive';
  return status === 'Monitoring' ? 'secondary' : 'outline';
}

@Injectable()
export class ThreatsViewModel {
  private readonly service = inject(ThreatService);

  readonly groups = computed<readonly ThreatGroup[]>(() =>
    TIERS.map((tier) => ({
      tier,
      threats: this.service
        .threats()
        .filter((threat) => threat.tier === tier)
        .map((threat) => ({ threat, badge: badgeFor(threat.status) })),
    })).filter((group) => group.threats.length > 0),
  );

  /** Threats not yet contained. */
  readonly openCount = computed(
    () => this.service.threats().filter((threat) => threat.status !== 'Contained').length,
  );

  /** Open threats that need senior clearance to respond to. */
  readonly seniorCount = computed(
    () =>
      this.service
        .threats()
        .filter((threat) => threat.status !== 'Contained' && threat.tier >= SENIOR_TIER).length,
  );
}
