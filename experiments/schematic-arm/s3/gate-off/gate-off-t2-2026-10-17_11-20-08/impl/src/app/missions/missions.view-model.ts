import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { clearanceLabel } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import type { Mission, MissionStatus } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import { MISSION_BADGE, type MissionBadge } from '../ui/hero-presentation';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface MissionRow {
  readonly mission: Mission;
  readonly heroName: string;
  readonly threatName: string;
  readonly tier: string;
  readonly statusBadge: MissionBadge;
}

// The missions screen's state and logic, no DOM. Component-scoped (no providedIn): the
// Missions component provides it, so each visit starts with a fresh launch panel.
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);

  // Deploy on a hero's page links here with ?hero=ID. The router reuses this component when
  // only the query changes, so the param is a stream, not a snapshot.
  private readonly routeHeroId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('hero') ?? '')),
    { requireSync: true },
  );

  private readonly activeHeroes = computed(() => this.heroService.heroes().filter((hero) => hero.status === 'Active'));
  private readonly openThreats = computed(() => this.threatService.threats().filter((threat) => threat.status === 'Open'));

  // Choices the launch panel holds. The hero follows the route; the threat defaults to the first open one.
  readonly heroId = linkedSignal(() => this.routeHeroId());
  readonly threatId = linkedSignal(() => this.openThreats()[0]?.id ?? '');

  readonly heroOptions = computed<readonly SelectOption[]>(() =>
    this.activeHeroes().map((hero) => ({ value: hero.id, label: `${hero.name} (${hero.id})` })),
  );
  readonly threatOptions = computed<readonly SelectOption[]>(() =>
    this.openThreats().map((threat) => ({ value: threat.id, label: `${threat.name}, ${clearanceLabel(threat.tier)}` })),
  );

  // Only an Active hero and an open threat make a launch; anything else leaves Deploy disabled.
  readonly launchTarget = computed(() => {
    const hero = this.activeHeroes().find((candidate) => candidate.id === this.heroId());
    const threat = this.openThreats().find((candidate) => candidate.id === this.threatId());
    return hero && threat ? { hero, threat } : null;
  });

  readonly launchHint = computed(() => {
    if (this.activeHeroes().length === 0) {
      return 'No active heroes are available to deploy.';
    }
    if (this.openThreats().length === 0) {
      return 'No open threats need a response.';
    }
    return this.launchTarget() ? '' : 'Choose an active hero and an open threat.';
  });

  readonly liveCount = this.missionService.liveCount;

  readonly rows = computed<readonly MissionRow[]>(() =>
    this.missionService.missions().map((mission) => {
      const threat = this.threatService.findById(mission.threatId);
      return {
        mission,
        heroName: this.heroService.findById(mission.heroId)?.name ?? mission.heroId,
        threatName: threat?.name ?? mission.threatId,
        tier: threat ? clearanceLabel(threat.tier) : '',
        statusBadge: MISSION_BADGE[mission.status],
      };
    }),
  );

  setHero(value: string | null | undefined): void {
    if (value) {
      this.heroId.set(value);
    }
  }

  setThreat(value: string | null | undefined): void {
    if (value) {
      this.threatId.set(value);
    }
  }

  launch(): void {
    const target = this.launchTarget();
    if (target) {
      this.missionService.deploy(target.hero.id, target.threat.id);
    }
  }

  resolve(id: string, status: Exclude<MissionStatus, 'Live'>): void {
    this.missionService.resolve(id, status);
  }
}
