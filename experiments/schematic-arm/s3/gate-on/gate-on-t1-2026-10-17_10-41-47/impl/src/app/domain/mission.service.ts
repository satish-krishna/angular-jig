import { computed, inject, Service, signal } from '@angular/core';
import type { StatusVariant } from './hero-presentation';
import { HeroService } from './hero.service';
import { EXAMPLE_MISSIONS } from './mission.example-data';
import { type Mission, type MissionOutcome, OUTCOME_VARIANT } from './mission.model';
import { ThreatService } from './threat.service';

/** One mission as a screen shows it: the threat and the crew resolved to names. */
export interface MissionEntry {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly outcome: MissionOutcome;
  readonly variant: StatusVariant;
  readonly threatName: string;
  readonly heroIds: readonly string[];
  readonly heroNames: readonly string[];
}

/**
 * The mission log as in-memory signal state. There is no backend: the log is EXAMPLE DATA.
 * `board` joins each mission to the live roster and threat register, so a renamed hero or
 * a changed threat shows up on every screen that reads the board.
 */
@Service()
export class MissionService {
  private readonly _heroes = inject(HeroService);
  private readonly _threats = inject(ThreatService);
  private readonly missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  /** Every mission, newest first. Ties keep the order they were seeded in. */
  readonly board = computed<readonly MissionEntry[]>(() => {
    const roster = this._heroes.roster();
    const threats = this._threats.register();
    return this.missions()
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((mission) => ({
        id: mission.id,
        name: mission.name,
        date: mission.date,
        outcome: mission.outcome,
        variant: OUTCOME_VARIANT[mission.outcome],
        threatName: threats.find((threat) => threat.id === mission.threatId)?.name ?? 'Unknown threat',
        heroIds: mission.heroIds,
        heroNames: mission.heroIds.map((id) => roster.find((hero) => hero.id === id)?.name ?? id),
      }));
  });
}
