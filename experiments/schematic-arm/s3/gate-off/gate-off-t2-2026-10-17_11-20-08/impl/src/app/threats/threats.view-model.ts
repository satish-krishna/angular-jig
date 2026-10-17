import { computed, inject, Injectable } from '@angular/core';
import { clearanceLabel } from '../domain/hero.model';
import { MissionService } from '../domain/mission.service';
import type { Threat } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';
import { THREAT_BADGE, type ThreatBadge } from '../ui/hero-presentation';

export interface ThreatRow {
  readonly threat: Threat;
  readonly tier: string;
  /** Live deployments against this threat, from the shared mission log. */
  readonly live: number;
  readonly statusBadge: ThreatBadge;
}

// The threat board's state and logic, no DOM. Component-scoped (no providedIn): the Threats
// component provides it. The board is read-only; only the mission log changes under it.
@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);
  private readonly missionService = inject(MissionService);

  readonly openCount = this.threatService.openCount;
  readonly liveCount = this.missionService.liveCount;

  // Highest tier first, so the most dangerous open threats lead the table.
  readonly rows = computed<readonly ThreatRow[]>(() =>
    this.threatService
      .threats()
      .map((threat) => ({
        threat,
        tier: clearanceLabel(threat.tier),
        live: this.missionService
          .missions()
          .filter((mission) => mission.threatId === threat.id && mission.status === 'Live').length,
        statusBadge: THREAT_BADGE[threat.status],
      }))
      .sort((a, b) => b.threat.tier - a.threat.tier),
  );
}
