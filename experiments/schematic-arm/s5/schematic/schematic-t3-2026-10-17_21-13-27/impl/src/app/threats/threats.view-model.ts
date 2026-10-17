import { Injectable, computed, inject } from '@angular/core';
import type { HeroClearance } from '../hero/hero.model';
import type { BadgeVariant } from '../hero/hero-presentation';
import { ThreatService } from '../threat/threat.service';
import type { ThreatStatus } from '../threat/threat.model';

const STATUS_ORDER: Readonly<Record<ThreatStatus, number>> = { Open: 0, Contained: 1, Resolved: 2 };

const TIER_RANK: Readonly<Record<HeroClearance, number>> = {
  'Tier 1': 1,
  'Tier 2': 2,
  'Tier 3': 3,
  'Tier 4': 4,
  'Tier 5': 5,
};

const STATUS_VARIANT: Readonly<Record<ThreatStatus, BadgeVariant>> = {
  Open: 'destructive',
  Contained: 'warning',
  Resolved: 'success',
};

/** Open threats first, then the highest clearance required first. */
@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);

  readonly threats = computed(() =>
    [...this.threatService.threats()].sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        TIER_RANK[b.requiredClearance] - TIER_RANK[a.requiredClearance],
    ),
  );

  readonly summary = computed(
    () => `${this.threatService.open()} open, ${this.threatService.contained()} contained`,
  );

  readonly statusVariant = (status: ThreatStatus): BadgeVariant => STATUS_VARIANT[status];

  contain(id: string): void {
    this.threatService.setStatus(id, 'Contained');
  }

  resolve(id: string): void {
    this.threatService.setStatus(id, 'Resolved');
  }
}
