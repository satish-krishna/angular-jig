import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OPERATIONS_EXAMPLE } from '../domain/operations.example-data';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { ThreatService } from '../domain/threat.service';
import { HERO_STATUS_BADGE, type StatusBadge } from '../ui/hero-format';
import type { StatFigure } from '../ui/stat-tile';

/** How many heroes the dashboard's "top heroes" grid shows. */
const TOP_HERO_COUNT = 4;

/** A roster row for the dashboard table: the record plus the badge variant its status takes. */
export interface DashboardRow extends Hero {
  readonly statusVariant: StatusBadge;
}

// Owns the dashboard's data and derived figures. Component-scoped (provided by Dashboard), so no providedIn.
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);
  private readonly threats = inject(ThreatService);
  private readonly router = inject(Router);

  readonly heroCount = this.heroes.count;

  private readonly activeCount = computed(
    () => this.heroes.list().filter((hero) => hero.status === 'Active').length,
  );

  private readonly averagePower = computed(() => {
    const list = this.heroes.list();
    const total = list.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return list.length === 0 ? 0 : Math.round(total / list.length);
  });

  /** The whole roster, strongest first. */
  readonly roster = computed<readonly DashboardRow[]>(() =>
    [...this.heroes.list()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ ...hero, statusVariant: HERO_STATUS_BADGE[hero.status] })),
  );

  readonly topHeroes = computed<readonly DashboardRow[]>(() => this.roster().slice(0, TOP_HERO_COUNT));

  readonly stats = computed<readonly StatFigure[]>(() => [
    {
      label: 'Heroes on roster',
      value: this.heroCount(),
      hint: `${this.activeCount()} active`,
      icon: 'lucideUserCheck',
    },
    {
      label: 'Missions live',
      value: OPERATIONS_EXAMPLE.liveMissions,
      hint: 'Example data',
      icon: 'lucideActivity',
    },
    {
      label: 'Average power',
      value: this.averagePower(),
      hint: 'Power index, 0-100',
      icon: 'lucideZap',
    },
    {
      label: 'Open threats',
      value: this.threats.openCount(),
      hint: 'From the threat board',
      icon: 'lucideShieldAlert',
    },
  ]);

  openHero(hero: Hero): void {
    void this.router.navigate(['detail', hero.id]);
  }
}
