import { Service, computed, signal } from '@angular/core';
import type { Hero, HeroDraft } from './hero.model';
import type { Mission } from './mission.model';
import { EXAMPLE_HEROES } from './example-heroes';
import { EXAMPLE_MISSIONS } from './example-missions';

const heroIdFor = (number: number): string => `HRO-${String(number).padStart(4, '0')}`;

/**
 * In-memory hero store. There is no backend: the roster and mission log are EXAMPLE DATA
 * (see example-heroes.ts and example-missions.ts) held as signal state for the lifetime of the app.
 * Every screen reads and writes this one store, so a change on one screen shows on the others.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_HEROES);
  private readonly missionLog = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  readonly list = this.heroes.asReadonly();
  readonly count = computed(() => this.heroes().length);
  /** Every deployment in the log, oldest first. */
  readonly missions = this.missionLog.asReadonly();

  byId(id: string): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  /** The mission log entries for one hero, oldest first. */
  missionsFor(id: string): readonly Mission[] {
    return this.missionLog().filter((mission) => mission.heroId === id);
  }

  /** Replaces the editable fields of one hero. The id never changes. */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): void {
    this.heroes.update((list) =>
      list.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)),
    );
  }

  /**
   * Adds a recruit to the roster: Active, clearance Tier 1, no missions yet.
   * Returns the new id. Ids already used by a retired hero's missions are skipped, so a
   * recruit never inherits another hero's record.
   */
  recruit(draft: HeroDraft): string {
    const taken = new Set([
      ...this.heroes().map((hero) => hero.id),
      ...this.missionLog().map((mission) => mission.heroId),
    ]);
    let number = this.heroes().length + 1;
    while (taken.has(heroIdFor(number))) number += 1;
    const hero: Hero = {
      ...draft,
      id: heroIdFor(number),
      status: 'Active',
      clearanceTier: 1,
      missionCount: 0,
      successRate: 0,
    };
    this.heroes.update((list) => [...list, hero]);
    return hero.id;
  }

  /** Logs a new deployment and counts it against the hero. */
  deploy(id: string): void {
    const hero = this.byId(id);
    if (!hero) return;
    this.update(id, { missionCount: hero.missionCount + 1 });
    this.missionLog.update((log) => [
      ...log,
      {
        id: `MSN-${String(log.length + 1).padStart(4, '0')}`,
        heroId: id,
        title: 'Field deployment',
        result: 'In field',
      },
    ]);
  }

  /** Removes a hero from the active roster. Their mission record stays in the log. */
  retire(id: string): void {
    this.heroes.update((list) => list.filter((hero) => hero.id !== id));
  }
}
