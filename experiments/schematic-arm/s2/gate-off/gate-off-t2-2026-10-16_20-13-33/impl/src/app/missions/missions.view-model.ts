import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import type { Mission } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import type { Threat } from '../domain/threat.model';

/** One mission row: the mission, its threat, whether the selected hero may go, and how many deployments it has. */
export interface MissionRow {
  readonly mission: Mission;
  readonly threat: Threat | undefined;
  readonly eligible: boolean;
  readonly deployments: number;
}

/** One line of the deployment log, with names instead of ids. */
export interface DeploymentLine {
  readonly id: string;
  readonly heroName: string;
  readonly missionTitle: string;
}

/**
 * The missions screen's state: the hero being deployed (taken from the `?hero=` the detail
 * screen sends, or chosen here), the mission board, and the deployment log. Component-scoped.
 */
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly route = inject(ActivatedRoute);

  /** The `hero` id the detail screen sends with the link. Read through the param stream. */
  private readonly routeHero = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('hero') ?? '')),
    { initialValue: '' },
  );

  /** The hero to deploy. Starts from the link; the operator can pick another. */
  readonly heroId = linkedSignal(() => this.routeHero());

  /** Only Active heroes can be deployed, so only they are offered. */
  readonly activeHeroes = computed<readonly Hero[]>(() =>
    this.heroes.heroes().filter((hero) => hero.status === 'Active'),
  );

  private readonly selectedHero = computed(() => this.heroes.byId(this.heroId()));

  /** Feedback line for the last deployment attempt. */
  readonly notice = signal('');

  readonly rows = computed<readonly MissionRow[]>(() => {
    const heroId = this.heroId();
    const deployments = this.missions.deployments();
    return this.missions.missions.map((mission) => ({
      mission,
      threat: this.missions.threatFor(mission.id),
      eligible: this.missions.canDeploy(heroId, mission.id),
      deployments: deployments.filter((deployment) => deployment.missionId === mission.id).length,
    }));
  });

  /** The deployment log, newest first, with names in place of ids. */
  readonly log = computed<readonly DeploymentLine[]>(() =>
    this.missions
      .deployments()
      .map((deployment) => ({
        id: deployment.id,
        heroName: this.heroes.byId(deployment.heroId)?.name ?? deployment.heroId,
        missionTitle: this.missions.missionById(deployment.missionId)?.title ?? deployment.missionId,
      }))
      .reverse(),
  );

  /** The select's item-to-string: a hero's name for a hero id. */
  readonly heroLabel = (id: string): string => this.heroes.byId(id)?.name ?? id;

  selectHero(id: string | null | undefined): void {
    this.heroId.set(id ?? '');
    this.notice.set('');
  }

  /** Deploy the selected hero onto a mission. The service decides; the notice reports the outcome. */
  deploy(missionId: string): void {
    const hero = this.selectedHero();
    if (!hero) {
      return;
    }
    const deployed = this.missions.deploy(hero.id, missionId);
    this.notice.set(
      deployed
        ? `${hero.name} deployed.`
        : `${hero.name} cannot be deployed here. Check status and clearance.`,
    );
  }
}
