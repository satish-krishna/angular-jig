import type { Mission, MissionStatus } from '../domain/mission.model';
import { threatById } from '../domain/threat.data';
import type { StatusVariant } from './hero-status';

// A mission as a screen shows it: the threat it targets, not the raw threat ID.
export interface MissionLine {
  readonly id: string;
  readonly heroId: string;
  readonly target: string;
  readonly status: MissionStatus;
  readonly statusVariant: StatusVariant;
}

// A live deployment is in progress, so it reads as neutral. A win reads as success and a loss as destructive.
const MISSION_VARIANT: Record<MissionStatus, StatusVariant> = {
  Live: 'default',
  Won: 'success',
  Lost: 'destructive',
};

export function missionLine(mission: Mission): MissionLine {
  return {
    id: mission.id,
    heroId: mission.heroId,
    target: threatById(mission.threatId)?.name ?? 'Unknown threat',
    status: mission.status,
    statusVariant: MISSION_VARIANT[mission.status],
  };
}
