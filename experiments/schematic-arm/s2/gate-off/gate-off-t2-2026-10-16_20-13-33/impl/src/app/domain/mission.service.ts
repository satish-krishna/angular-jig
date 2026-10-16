import { inject, Service, signal } from '@angular/core';
import { EXAMPLE_MISSIONS } from './example-missions';
import { HeroService } from './hero.service';
import type { Deployment, Mission } from './mission.model';
import { isCleared, type Threat } from './threat.model';
import { ThreatService } from './threat.service';

/**
 * Missions and the deployments made onto them. A deployment writes back to the hero: it
 * adds one mission to the hero's record, so the dashboard and roster show it at once.
 */
@Service()
export class MissionService {
  private readonly heroes = inject(HeroService);
  private readonly threats = inject(ThreatService);

  /** The mission list. EXAMPLE DATA, read-only. */
  readonly missions: readonly Mission[] = EXAMPLE_MISSIONS;

  private readonly log = signal<readonly Deployment[]>([]);

  /** Every deployment made since the roster was last reset, oldest first. */
  readonly deployments = this.log.asReadonly();

  /** Look up one mission by id. Returns `undefined` when no mission has that id. */
  missionById(id: string): Mission | undefined {
    return this.missions.find((mission) => mission.id === id);
  }

  /** The threat a mission targets, or `undefined` when the mission or its threat is unknown. */
  threatFor(missionId: string): Threat | undefined {
    const mission = this.missionById(missionId);
    return mission ? this.threats.byId(mission.threatId) : undefined;
  }

  /**
   * Whether a hero may be deployed onto a mission: the hero is Active and cleared for the
   * mission's threat. Both the screen and `deploy` use this, so a disabled button and a
   * refused deployment agree.
   */
  canDeploy(heroId: string, missionId: string): boolean {
    const hero = this.heroes.byId(heroId);
    const threat = this.threatFor(missionId);
    return !!hero && !!threat && hero.status === 'Active' && isCleared(hero, threat);
  }

  /**
   * Deploy a hero onto a mission. Returns `true` when the deployment was recorded and the
   * hero's mission count went up, `false` when the hero is not eligible.
   */
  deploy(heroId: string, missionId: string): boolean {
    const hero = this.heroes.byId(heroId);
    if (!hero || !this.canDeploy(heroId, missionId)) {
      return false;
    }
    this.log.update((list) => [
      ...list,
      { id: `DEP-${String(list.length + 1).padStart(3, '0')}`, missionId, heroId },
    ]);
    this.heroes.update(hero.id, { missions: hero.missions + 1 });
    return true;
  }

  /** Clear the deployment log. Paired with `HeroService.reset`, which restores the mission counts. */
  reset(): void {
    this.log.set([]);
  }
}
