import { computed, inject, Injectable } from '@angular/core';
import { MissionService } from '../domain/mission.service';
import type { Threat } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';
import { threatLevelTone, threatStatusTone } from '../ui/mission-presentation';
import type { BadgeTone } from '../ui/mission-presentation';

export interface ThreatRow {
  readonly threat: Threat;
  readonly levelTone: BadgeTone;
  readonly statusTone: BadgeTone;
  /** How many missions in the log answer this threat. */
  readonly missions: number;
}

/** Component-scoped: the threats screen provides it, so each visit reads the register afresh. */
@Injectable()
export class ThreatsViewModel {
  private readonly threats = inject(ThreatService);
  private readonly missions = inject(MissionService);

  /** The register, most severe first, then by codename so equal levels read in a stable order. */
  readonly rows = computed<readonly ThreatRow[]>(() => {
    const log = this.missions.log();
    return this.threats
      .threats()
      .map((threat) => ({
        threat,
        levelTone: threatLevelTone(threat.level),
        statusTone: threatStatusTone(threat.status),
        missions: log.filter((mission) => mission.threatId === threat.id).length,
      }))
      .sort((a, b) => severityRank(b.threat.level) - severityRank(a.threat.level) || a.threat.codename.localeCompare(b.threat.codename));
  });

  readonly openCount = computed(() => this.rows().filter((row) => row.threat.status === 'Open').length);
  readonly monitoringCount = computed(() => this.rows().filter((row) => row.threat.status === 'Monitoring').length);
  readonly containedCount = computed(() => this.rows().filter((row) => row.threat.status === 'Contained').length);
}

const SEVERITY = { Low: 0, Elevated: 1, Severe: 2, Critical: 3 } as const satisfies Record<Threat['level'], number>;

function severityRank(level: Threat['level']): number {
  return SEVERITY[level];
}
