import { Injectable, computed, inject } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { THREAT_LEVELS, type Threat, type ThreatLevel, type ThreatStatus } from '../domain/threat';
import { ThreatService } from '../domain/threat.service';

/** Badge colour for each severity. */
const LEVEL_VARIANT: Record<ThreatLevel, BadgeVariants['variant']> = {
  Low: 'outline',
  Moderate: 'secondary',
  High: 'warning',
  Critical: 'destructive',
};

/** Badge colour for each status. */
const STATUS_VARIANT: Record<ThreatStatus, BadgeVariants['variant']> = {
  Open: 'warning',
  Monitoring: 'secondary',
  Contained: 'success',
};

/** One threat card: the report plus the badge colours it needs. */
export interface ThreatRow {
  readonly threat: Threat;
  readonly levelVariant: BadgeVariants['variant'];
  readonly statusVariant: BadgeVariants['variant'];
}

/**
 * State for the threat board: the reports ordered by severity, and the counts across them.
 * Component-scoped, so each visit to the board starts from the current reports.
 */
@Injectable()
export class ThreatsViewModel {
  private readonly _threats = inject(ThreatService);

  /** Most severe first; within a level, the report title sets the order. */
  public readonly rows = computed<readonly ThreatRow[]>(() =>
    [...this._threats.threats()]
      .sort((a, b) => THREAT_LEVELS.indexOf(b.level) - THREAT_LEVELS.indexOf(a.level) || a.title.localeCompare(b.title))
      .map((threat) => ({
        threat,
        levelVariant: LEVEL_VARIANT[threat.level],
        statusVariant: STATUS_VARIANT[threat.status],
      })),
  );

  /** Reports not yet contained: open or being monitored. */
  public readonly activeCount = computed(
    () => this._threats.threats().filter((threat) => threat.status !== 'Contained').length,
  );

  public readonly criticalCount = computed(
    () => this._threats.threats().filter((threat) => threat.level === 'Critical').length,
  );

  public readonly containedCount = computed(
    () => this._threats.threats().filter((threat) => threat.status === 'Contained').length,
  );
}
