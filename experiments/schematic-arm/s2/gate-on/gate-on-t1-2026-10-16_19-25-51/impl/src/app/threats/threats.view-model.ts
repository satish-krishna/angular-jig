import { computed, inject, Injectable } from '@angular/core';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import type { StatTileIcon } from '../ui/stat-tile/stat-tile';

/** An open incident: a hero who is injured or missing. MIA is critical; Injured is elevated. */
export interface Incident {
  readonly hero: Hero;
  readonly severity: 'Critical' | 'Elevated';
  readonly variant: 'destructive' | 'warning';
}

export interface ThreatStat {
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly icon: StatTileIcon;
}

/** Turns roster status into open incidents. Holds no state of its own. */
@Injectable()
export class ThreatsViewModel {
  private readonly heroes = inject(HeroService).heroes;

  /** Open incidents, missing heroes first, then strongest first. */
  readonly incidents = computed<readonly Incident[]>(() =>
    this.heroes()
      .filter((hero) => hero.status === 'MIA' || hero.status === 'Injured')
      .sort((a, b) => Number(b.status === 'MIA') - Number(a.status === 'MIA') || b.powerIndex - a.powerIndex)
      .map((hero): Incident =>
        hero.status === 'MIA'
          ? { hero, severity: 'Critical', variant: 'destructive' }
          : { hero, severity: 'Elevated', variant: 'warning' },
      ),
  );

  readonly stats = computed<readonly ThreatStat[]>(() => {
    const incidents = this.incidents();
    const missing = incidents.filter((incident) => incident.hero.status === 'MIA').length;
    return [
      { label: 'Open incidents', value: incidents.length, hint: 'Injured or MIA', icon: 'lucideShieldAlert' },
      { label: 'Missing in action', value: missing, hint: 'Critical: no contact', icon: 'lucideTriangleAlert' },
      { label: 'Injured', value: incidents.length - missing, hint: 'Elevated: off duty', icon: 'lucideActivity' },
    ];
  });
}
