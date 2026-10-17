import { computed, inject, Injectable } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Threat, ThreatStatus } from '../domain/threat';
import { ThreatService } from '../domain/threat.service';

const STATUS_VARIANT: Readonly<Record<ThreatStatus, BadgeVariants['variant']>> = {
  Open: 'default',
  Escalated: 'destructive',
  Contained: 'secondary',
};

// One threat card: the threat plus the badge variant its status carries.
export interface ThreatCard {
  readonly threat: Threat;
  readonly variant: BadgeVariants['variant'];
}

// Threats state: the board's counts and its cards, highest tier first. Component-scoped, provided by Threats.
@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);

  readonly openCount = computed(() => this.countOf('Open'));
  readonly escalatedCount = computed(() => this.countOf('Escalated'));
  readonly topTier = computed(() =>
    this.threatService.threats().reduce((max, threat) => Math.max(max, threat.tier), 0),
  );

  readonly cards = computed<readonly ThreatCard[]>(() =>
    [...this.threatService.threats()]
      .sort((a, b) => b.tier - a.tier || a.name.localeCompare(b.name))
      .map((threat) => ({ threat, variant: STATUS_VARIANT[threat.status] })),
  );

  private countOf(status: ThreatStatus): number {
    return this.threatService.threats().filter((threat) => threat.status === status).length;
  }
}
