import { computed, inject, Injectable } from '@angular/core';
import { EXAMPLE_THREATS } from '../domain/example-threats';
import type { Hero } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import type { ThreatWithHeroes } from '../domain/threat';

/**
 * State for the threats screen: every logged threat, most severe first, with its
 * assigned heroes resolved against the live roster. A retired hero drops off the
 * list instead of leaving a dead link. Component-scoped, so it dies with the screen.
 */
@Injectable()
export class ThreatsViewModel {
  private readonly heroService = inject(HeroService);

  readonly threats = computed<readonly ThreatWithHeroes[]>(() =>
    EXAMPLE_THREATS.map((threat) => ({
      ...threat,
      heroes: threat.assignedHeroIds
        .map((id) => this.heroService.byId(id))
        .filter((hero): hero is Hero => hero !== undefined),
    })).sort((a, b) => b.tier - a.tier),
  );

  readonly openCount = computed(() => this.threats().filter((threat) => threat.status === 'Open').length);
}
