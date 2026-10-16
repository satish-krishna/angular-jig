import { Injectable } from '@angular/core';
import { EXAMPLE_THREATS } from '../domain/threat.data';
import type { Threat, ThreatLevel, ThreatStatus } from '../domain/threat.model';
import type { BadgeVariant } from '../ui/hero-badges';

const STATUS_BADGE: Record<ThreatStatus, BadgeVariant> = {
  Active: 'destructive',
  Monitoring: 'warning',
  Contained: 'success',
};

/** Levels 4 and 5 pull heroes off duty, 3 needs watching, and 1 and 2 are routine. */
function variantForLevel(level: ThreatLevel): BadgeVariant {
  if (level >= 4) return 'destructive';
  return level === 3 ? 'warning' : 'secondary';
}

export interface ThreatCard {
  readonly threat: Threat;
  readonly levelVariant: BadgeVariant;
  readonly statusVariant: BadgeVariant;
}

/**
 * The threat board. The threats are example data that does not change during a
 * session, so the cards and summary figures are computed once rather than held
 * as signals.
 */
@Injectable()
export class ThreatsViewModel {
  /** Threats, most dangerous first. */
  readonly cards: readonly ThreatCard[] = [...EXAMPLE_THREATS]
    .sort((a, b) => b.level - a.level)
    .map((threat) => ({
      threat,
      levelVariant: variantForLevel(threat.level),
      statusVariant: STATUS_BADGE[threat.status],
    }));

  readonly trackedLabel = String(EXAMPLE_THREATS.length);

  readonly activeLabel = String(EXAMPLE_THREATS.filter((threat) => threat.status === 'Active').length);

  readonly topLevelLabel = `Level ${Math.max(...EXAMPLE_THREATS.map((threat) => threat.level))}`;
}
