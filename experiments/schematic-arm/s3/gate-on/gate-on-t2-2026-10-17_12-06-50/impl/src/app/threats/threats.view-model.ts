import { computed, inject, Injectable } from '@angular/core';
import { LEVEL_VARIANT, type BadgeVariant } from '../domain/mission.presentation';
import { MissionService } from '../domain/mission.service';
import { THREAT_LEVELS, type Threat } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';

export interface ThreatCard {
  readonly threat: Threat;
  readonly variant: BadgeVariant;
  readonly responding: number;
  readonly logged: number;
}

// Threats state and logic. Component-scoped: the component provides it.
@Injectable()
export class ThreatsViewModel {
  private readonly _threats = inject(ThreatService);
  private readonly _missions = inject(MissionService);

  // Most severe first. Each card counts the deployments answering that threat: in progress now, and logged in total.
  public readonly cards = computed<readonly ThreatCard[]>(() => {
    const log = this._missions.missions();

    return [...this._threats.threats]
      .sort((a, b) => THREAT_LEVELS.indexOf(b.level) - THREAT_LEVELS.indexOf(a.level))
      .map((threat) => {
        const against = log.filter((mission) => mission.threatId === threat.id);
        return {
          threat,
          variant: LEVEL_VARIANT[threat.level],
          responding: against.filter((mission) => mission.outcome === 'In progress').length,
          logged: against.length,
        };
      });
  });
}
