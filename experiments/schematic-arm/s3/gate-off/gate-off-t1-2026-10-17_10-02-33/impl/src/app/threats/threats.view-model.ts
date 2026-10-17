import { Injectable, computed, inject } from '@angular/core';
import { MissionService } from '../domain/mission.service';
import { EXAMPLE_THREATS } from '../domain/threat.data';
import type { Threat, ThreatStatus } from '../domain/threat.model';
import type { StatusVariant } from '../ui/hero-status';

export interface ThreatCard extends Threat {
  readonly statusVariant: StatusVariant;
  readonly liveMissions: number;
}

// Active is the alarm, so it takes the destructive colour. Contained is the good news. Monitoring sits between.
const THREAT_VARIANT: Record<ThreatStatus, StatusVariant> = {
  Active: 'destructive',
  Contained: 'success',
  Monitoring: 'warning',
};

// The threats screen's view: the threats by tier, each with the deployments live against it. No DOM.
@Injectable()
export class ThreatsViewModel {
  private readonly missionService = inject(MissionService);

  // Highest tier first.
  readonly threats = computed<readonly ThreatCard[]>(() => {
    const live = this.missionService.all().filter((mission) => mission.status === 'Live');
    return [...EXAMPLE_THREATS]
      .sort((a, b) => b.tier - a.tier)
      .map((threat) => ({
        ...threat,
        statusVariant: THREAT_VARIANT[threat.status],
        liveMissions: live.filter((mission) => mission.threatId === threat.id).length,
      }));
  });

  readonly activeCount = computed(() => this.threats().filter((threat) => threat.status === 'Active').length);
}
