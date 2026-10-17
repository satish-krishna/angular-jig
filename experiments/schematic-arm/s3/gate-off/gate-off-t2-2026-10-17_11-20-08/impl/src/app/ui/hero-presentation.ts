import type { HeroStatus } from '../domain/hero.model';
import type { MissionStatus } from '../domain/mission.model';
import type { ThreatStatus } from '../domain/threat.model';

export type StatusBadge = 'success' | 'warning' | 'outline' | 'destructive';

// Semantic colour carries the status: Active is green, Injured amber, MIA red.
export const STATUS_BADGE: Record<HeroStatus, StatusBadge> = {
  Active: 'success',
  Reserve: 'outline',
  Injured: 'warning',
  MIA: 'destructive',
};

export type MissionBadge = 'secondary' | 'success' | 'destructive';
export type ThreatBadge = 'warning' | 'success';

// A live mission reads as neutral until its result lands: green for a win, red for a loss.
export const MISSION_BADGE: Record<MissionStatus, MissionBadge> = {
  Live: 'secondary',
  Succeeded: 'success',
  Failed: 'destructive',
};

// An open threat is a warning; a contained one is resolved.
export const THREAT_BADGE: Record<ThreatStatus, ThreatBadge> = {
  Open: 'warning',
  Contained: 'success',
};

// "Dr. Ion" -> "DI", "The Tinkerer" -> "TT".
export function initialsOf(name: string): string {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
