import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { MissionOutcome } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { missionOutcomeTone } from '../ui/mission-presentation';
import type { BadgeTone } from '../ui/mission-presentation';

export interface MissionRow {
  readonly id: string;
  readonly operation: string;
  /** The hero's id while they are on the roster; null once they have been retired. */
  readonly heroId: string | null;
  readonly hero: string;
  readonly threat: string;
  readonly outcome: MissionOutcome;
  readonly outcomeTone: BadgeTone;
  readonly cycle: number;
}

export interface MissionStat {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: string;
}

const FORMER_OPERATIVE = 'Former operative';
const NO_THREAT = 'No threat assigned';

/** Component-scoped: the missions screen provides it, so each visit reads the log afresh. */
@Injectable()
export class MissionsViewModel {
  private readonly missions = inject(MissionService);
  private readonly heroes = inject(HeroService);
  private readonly threats = inject(ThreatService);

  /** The whole log, newest first. Hero and threat names are looked up so the table reads as prose. */
  readonly rows = computed<readonly MissionRow[]>(() => {
    const heroes = new Map(this.heroes.roster().map((hero) => [hero.id, hero]));
    const codenames = new Map(this.threats.threats().map((threat) => [threat.id, threat.codename]));

    return this.missions.log().map((mission) => {
      const hero = heroes.get(mission.heroId);
      return {
        id: mission.id,
        operation: mission.operation,
        heroId: hero ? hero.id : null,
        hero: hero ? hero.name : FORMER_OPERATIVE,
        threat: mission.threatId ? (codenames.get(mission.threatId) ?? 'Unknown threat') : NO_THREAT,
        outcome: mission.outcome,
        outcomeTone: missionOutcomeTone(mission.outcome),
        cycle: mission.cycle,
      };
    });
  });

  readonly stats = computed<readonly MissionStat[]>(() => {
    const log = this.missions.log();
    const live = log.filter((mission) => mission.outcome === 'In progress').length;
    const completed = log.filter((mission) => mission.outcome !== 'In progress');
    const successes = completed.filter((mission) => mission.outcome === 'Success').length;
    const rate = completed.length ? Math.round((successes / completed.length) * 100) : 0;

    return [
      { label: 'Live missions', value: String(live), detail: 'Deployed and not yet reported', icon: 'lucideActivity' },
      { label: 'Success rate', value: `${rate}%`, detail: `Across ${completed.length} completed missions`, icon: 'lucideCheck' },
      { label: 'Missions logged', value: String(log.length), detail: 'Every cycle on record', icon: 'lucideTarget' },
    ];
  });
}
