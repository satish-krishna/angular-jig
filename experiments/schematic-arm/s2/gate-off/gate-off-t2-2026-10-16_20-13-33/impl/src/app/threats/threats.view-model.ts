import { computed, inject, Injectable } from '@angular/core';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { tierRank, type Threat } from '../domain/threat.model';

/** Badge tone for a threat tier: the higher the tier, the more alarming the badge. */
export type TierTone = 'secondary' | 'outline' | 'warning' | 'destructive';

/** One threat row: the threat, its badge tone, and how many missions target it. */
export interface ThreatRow {
  readonly threat: Threat;
  readonly tone: TierTone;
  readonly missions: number;
}

const TIER_TONE: readonly TierTone[] = ['secondary', 'secondary', 'outline', 'warning', 'destructive'];

/** The threat register's state: every threat, most severe first, with its mission count. Component-scoped. */
@Injectable()
export class ThreatsViewModel {
  private readonly threats = inject(ThreatService);
  private readonly missions = inject(MissionService);

  readonly rows = computed<readonly ThreatRow[]>(() =>
    [...this.threats.threats]
      .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
      .map((threat) => ({
        threat,
        tone: TIER_TONE[tierRank(threat.tier)],
        missions: this.missions.missions.filter((mission) => mission.threatId === threat.id).length,
      })),
  );

  /** Footer count, for example "6 threats on the register". */
  readonly summary = computed(() => `${this.rows().length} threats on the register`);
}
