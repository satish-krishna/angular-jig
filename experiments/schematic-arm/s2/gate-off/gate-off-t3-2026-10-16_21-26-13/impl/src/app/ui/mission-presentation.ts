import type { MissionOutcome } from '../domain/mission.model';
import type { ThreatLevel, ThreatStatus } from '../domain/threat.model';

/** The badge tones the mission and threat screens use. Each maps onto a spartan badge variant. */
export type BadgeTone = 'success' | 'warning' | 'secondary' | 'destructive' | 'outline';

const OUTCOME_TONE = {
  'In progress': 'outline',
  Success: 'success',
  Partial: 'warning',
  Failed: 'destructive',
} as const satisfies Record<MissionOutcome, BadgeTone>;

const THREAT_LEVEL_TONE = {
  Low: 'success',
  Elevated: 'warning',
  Severe: 'destructive',
  Critical: 'destructive',
} as const satisfies Record<ThreatLevel, BadgeTone>;

const THREAT_STATUS_TONE = {
  Open: 'outline',
  Monitoring: 'secondary',
  Contained: 'success',
} as const satisfies Record<ThreatStatus, BadgeTone>;

export function missionOutcomeTone(outcome: MissionOutcome): BadgeTone {
  return OUTCOME_TONE[outcome];
}

export function threatLevelTone(level: ThreatLevel): BadgeTone {
  return THREAT_LEVEL_TONE[level];
}

export function threatStatusTone(status: ThreatStatus): BadgeTone {
  return THREAT_STATUS_TONE[status];
}
