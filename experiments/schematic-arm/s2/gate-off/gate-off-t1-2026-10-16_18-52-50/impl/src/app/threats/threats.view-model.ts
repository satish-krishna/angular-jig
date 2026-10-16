import { computed, inject, Injectable } from '@angular/core';
import type { StatusVariant } from '../domain/hero.presentation';
import type { ThreatStatus, ThreatTier } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';

/** One threat, shaped for the table: badge variants are decided here, not in the template. */
export interface ThreatRow {
  readonly id: string;
  readonly title: string;
  readonly district: string;
  readonly tier: ThreatTier;
  readonly tierVariant: StatusVariant;
  readonly status: ThreatStatus;
  readonly statusVariant: StatusVariant;
  readonly contained: boolean;
}

/** Tier 4 and up is destructive, 3 is a warning, and the rest are quiet. */
function tierVariant(tier: ThreatTier): StatusVariant {
  if (tier >= 4) return 'destructive';
  if (tier === 3) return 'warning';
  return 'secondary';
}

/**
 * Threats state: the board sorted so open threats come first, most severe first, and the
 * contain action. Containing a threat goes through the shared threat service.
 */
@Injectable()
export class ThreatsViewModel {
  private readonly threats = inject(ThreatService);

  readonly openCount = this.threats.openCount;

  readonly rows = computed<readonly ThreatRow[]>(() =>
    this.threats
      .all()
      .map((threat): ThreatRow => ({
        id: threat.id,
        title: threat.title,
        district: threat.district,
        tier: threat.tier,
        tierVariant: tierVariant(threat.tier),
        status: threat.status,
        statusVariant: threat.status === 'Open' ? 'destructive' : 'success',
        contained: threat.status === 'Contained',
      }))
      .sort((a, b) => Number(a.contained) - Number(b.contained) || b.tier - a.tier),
  );

  contain(id: string): void {
    this.threats.contain(id);
  }
}
