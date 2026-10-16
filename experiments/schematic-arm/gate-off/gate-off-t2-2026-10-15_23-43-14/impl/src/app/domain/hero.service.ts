import { Service, signal } from '@angular/core';
import type { ClearanceTier, Hero, PowerClass } from './hero';

/**
 * EXAMPLE DATA. This roster is illustrative content for the Hero Ops Console, not
 * a real personnel record. There is no backend: HeroService holds it as in-memory
 * signal state and loses every edit on reload.
 */
const EXAMPLE_ROSTER: readonly Hero[] = [
  { id: 'HRO-0007', name: 'Silverwing', alias: 'Ada Voss', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearance: 'Tier 4', missionCount: 64, successRate: 92 },
  { id: 'HRO-0012', name: 'Dr. Ion', alias: 'Marcus Reyes', powerClass: 'Energy', powerIndex: 94, status: 'Active', clearance: 'Tier 5', missionCount: 118, successRate: 88 },
  { id: 'HRO-0021', name: 'Vantablack', alias: 'Unknown', powerClass: 'Psionic', powerIndex: 81, status: 'Reserve', clearance: 'Tier 3', missionCount: 29, successRate: 79 },
  { id: 'HRO-0033', name: 'Aurora Vale', alias: 'Lena Park', powerClass: 'Cosmic', powerIndex: 97, status: 'Active', clearance: 'Tier 5', missionCount: 151, successRate: 90 },
  { id: 'HRO-0040', name: 'Magnetar', alias: 'Idris Kane', powerClass: 'Enhanced', powerIndex: 76, status: 'Injured', clearance: 'Tier 3', missionCount: 57, successRate: 84 },
  { id: 'HRO-0044', name: 'The Tinkerer', alias: 'Sam Okafor', powerClass: 'Tech', powerIndex: 69, status: 'Active', clearance: 'Tier 2', missionCount: 22, successRate: 95 },
  { id: 'HRO-0051', name: 'Halcyon', alias: 'Priya Nair', powerClass: 'Psionic', powerIndex: 85, status: 'Active', clearance: 'Tier 4', missionCount: 73, successRate: 87 },
  { id: 'HRO-0058', name: 'Rift', alias: 'Classified', powerClass: 'Cosmic', powerIndex: 91, status: 'Reserve', clearance: 'Tier 4', missionCount: 44, successRate: 82 },
  { id: 'HRO-0063', name: 'Ember Cho', alias: 'Jae Cho', powerClass: 'Energy', powerIndex: 78, status: 'Active', clearance: 'Tier 3', missionCount: 48, successRate: 86 },
  { id: 'HRO-0070', name: 'Null', alias: 'Unknown', powerClass: 'Mutant', powerIndex: 83, status: 'MIA', clearance: 'Tier 4', missionCount: 66, successRate: 80 },
  { id: 'HRO-0075', name: 'Grond', alias: 'Boris Volkov', powerClass: 'Enhanced', powerIndex: 72, status: 'Active', clearance: 'Tier 2', missionCount: 31, successRate: 90 },
  { id: 'HRO-0081', name: 'Ms. Meridian', alias: 'Grace Bello', powerClass: 'Tech', powerIndex: 80, status: 'Active', clearance: 'Tier 3', missionCount: 59, successRate: 89 },
];

/** Fields a caller may change. The id is fixed once a hero is recruited. */
export type HeroChanges = Partial<Omit<Hero, 'id'>>;

/** What a recruit supplies. A new hero starts in reserve with no mission record. */
export interface HeroDraft {
  readonly name: string;
  readonly alias: string;
  readonly powerClass: PowerClass;
  readonly powerIndex: number;
  readonly clearance: ClearanceTier;
}

/**
 * In-memory hero store over the example roster. Singleton, root-provided by `@Service()`.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The full roster. Read it inside a computed() or template to stay reactive. */
  readonly roster = this.heroes.asReadonly();

  /** Looks a hero up by id. Reads the signal, so it stays reactive inside a computed(). */
  byId(id: string): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  /** Applies changes to one hero. Returns the updated record, or undefined if the id is unknown. */
  update(id: string, changes: HeroChanges): Hero | undefined {
    const current = this.byId(id);
    if (!current) {
      return undefined;
    }
    const next: Hero = { ...current, ...changes };
    this.heroes.update((roster) => roster.map((hero) => (hero.id === id ? next : hero)));
    return next;
  }

  /** Removes a hero from the roster. Returns false if the id is unknown. */
  retire(id: string): boolean {
    if (!this.byId(id)) {
      return false;
    }
    this.heroes.update((roster) => roster.filter((hero) => hero.id !== id));
    return true;
  }

  /** Adds a recruit to the roster under the next free id and returns the new record. */
  recruit(draft: HeroDraft): Hero {
    const hero: Hero = {
      ...draft,
      name: draft.name.trim(),
      alias: draft.alias.trim(),
      id: nextId(this.heroes()),
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.heroes.update((roster) => [...roster, hero]);
    return hero;
  }

  /** Puts the example roster back, discarding every edit made this session. */
  reset(): void {
    this.heroes.set(EXAMPLE_ROSTER);
  }
}

/** The next HRO-#### id after the highest one on the roster. */
function nextId(roster: readonly Hero[]): string {
  const highest = roster.reduce((max, hero) => Math.max(max, Number(hero.id.replace(/\D/g, ''))), 0);
  return `HRO-${String(highest + 1).padStart(4, '0')}`;
}
