import { Injectable, computed, inject } from '@angular/core';
import { MissionService } from '../mission/mission.service';
import { threatStatusVariant } from '../ops/badges';
import { ThreatService } from '../threat/threat.service';

// Component-scoped (no providedIn): the threats screen provides it.
@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);
  private readonly missionService = inject(MissionService);

  readonly threats = this.threatService.threats;

  readonly unresolved = computed(() => this.threats().filter((threat) => threat.status !== 'Contained').length);

  readonly statusVariant = threatStatusVariant;

  // Containing goes through the mission service, so live missions against the threat close with it.
  contain(threatId: string): void {
    this.missionService.contain(threatId);
  }
}
