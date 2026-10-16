import { computed, inject, Service, signal } from '@angular/core';
import type { Hero } from './hero.model';
import { HeroService } from './hero.service';
import { EXAMPLE_MISSIONS } from './mission.example-missions';
import type { Mission } from './mission.model';

/**
 * Live missions, held as in-memory signal state beside the roster. Like the roster, it
 * is EXAMPLE DATA and resets when the page reloads.
 */
@Service()
export class MissionService {
  private readonly heroes = inject(HeroService);
  private readonly missions = signal<readonly Mission[]>(EXAMPLE_MISSIONS);

  /** The highest MSN number issued so far. Ids are never reused. */
  private highestIssued = Math.max(...EXAMPLE_MISSIONS.map((mission) => Number(mission.id.slice(4))));

  /** Every live mission, read-only to consumers. */
  readonly live = this.missions.asReadonly();

  /** The ids of the heroes currently in the field. */
  private readonly inField = computed(() => new Set(this.missions().map((mission) => mission.heroId)));

  /** Whether a hero may be sent out: on the roster, Active, and not already in the field. */
  canDeploy(hero: Hero | undefined): boolean {
    return hero?.status === 'Active' && !this.inField().has(hero.id);
  }

  /** Send an Active hero into the field. The hero's record gains one mission. Refused heroes are a no-op. */
  deploy(heroId: string): void {
    const hero = this.heroes.byId(heroId);
    if (!hero || !this.canDeploy(hero)) return;

    this.highestIssued += 1;
    const mission: Mission = {
      id: `MSN-${String(this.highestIssued).padStart(4, '0')}`,
      codename: 'Open deployment',
      heroId: hero.id,
      district: 'To be assigned',
      objective: 'No objective filed yet.',
    };
    this.missions.update((list) => [...list, mission]);
    this.heroes.update(hero.id, { missionCount: hero.missionCount + 1 });
  }

  /** Close one mission. Unknown ids are a no-op. */
  standDown(missionId: string): void {
    this.missions.update((list) => list.filter((mission) => mission.id !== missionId));
  }

  /** Close every mission a hero is on. The roster calls this when a hero retires. */
  standDownFor(heroId: string): void {
    this.missions.update((list) => list.filter((mission) => mission.heroId !== heroId));
  }
}
