import { Injectable, computed, inject } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { HeroService } from '../domain/hero.service';
import { heroSchema } from '../domain/hero.schema';
import { heroCode } from '../domain/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

// The clearance tiers come off the schema, so the threat ladder cannot drift from the form.
const TIERS = heroSchema.shape.clearance.options;

// Threat level names for each tier, lowest first. Example labels for this console.
const LEVELS: readonly string[] = ['Routine', 'Elevated', 'Serious', 'Severe', 'Cosmic'];

// Active responders needed before a tier counts as covered.
const COVER_MINIMUM = 3;

export interface ThreatRow {
  readonly tier: string;
  readonly level: string;
  readonly responders: number;
  readonly standby: number;
  readonly unavailable: number;
  readonly coverage: string;
  readonly coverageVariant: BadgeVariants['variant'];
}

export interface ThreatStat {
  readonly label: string;
  readonly value: number | string;
  readonly hint: string;
  readonly icon: StatIcon;
}

// A tier is answered by every hero cleared at or above it. Coverage counts only the Active ones.
function coverageOf(responders: number): Pick<ThreatRow, 'coverage' | 'coverageVariant'> {
  if (responders >= COVER_MINIMUM) {
    return { coverage: 'Covered', coverageVariant: 'success' };
  }
  if (responders > 0) {
    return { coverage: 'Thin', coverageVariant: 'warning' };
  }
  return { coverage: 'Gap', coverageVariant: 'destructive' };
}

// Threat tiers, their coverage, and the open alerts, all derived from the shared roster. Component-scoped, no DOM.
@Injectable()
export class ThreatsViewModel {
  private readonly heroes = inject(HeroService).heroes;

  readonly rows = computed<readonly ThreatRow[]>(() => {
    const all = this.heroes();
    return TIERS.map((tier, index) => {
      const cleared = all.filter((hero) => TIERS.indexOf(hero.clearance) >= index);
      const responders = cleared.filter((hero) => hero.status === 'Active').length;
      return {
        tier,
        level: LEVELS[index] ?? '',
        responders,
        standby: cleared.filter((hero) => hero.status === 'Reserve').length,
        unavailable: cleared.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
        ...coverageOf(responders),
      };
    });
  });

  readonly alerts = computed<readonly string[]>(() => {
    const coverage = this.rows()
      .filter((row) => row.coverage !== 'Covered')
      .map((row) => `${row.tier} (${row.level}): ${row.responders} active responder${row.responders === 1 ? '' : 's'}. ${row.coverage}.`);
    const missing = this.heroes()
      .filter((hero) => hero.status === 'MIA')
      .map((hero) => `${hero.name} (${heroCode(hero.id)}) is MIA. Status unresolved.`);
    return [...coverage, ...missing];
  });

  readonly stats = computed<readonly ThreatStat[]>(() => {
    const rows = this.rows();
    const covered = rows.filter((row) => row.coverage === 'Covered').length;
    const onDuty = this.heroes().filter((hero) => hero.status === 'Active').length;
    return [
      { label: 'Tiers covered', value: `${covered} of ${rows.length}`, hint: `At least ${COVER_MINIMUM} active responders`, icon: 'lucideShieldAlert' },
      { label: 'Open alerts', value: this.alerts().length, hint: 'Coverage gaps and MIA heroes', icon: 'lucideActivity' },
      { label: 'Responders on duty', value: onDuty, hint: 'Active heroes, all clearances', icon: 'lucideUserCheck' },
      { label: 'Highest tier answered', value: rows.filter((row) => row.responders > 0).at(-1)?.tier ?? 'None', hint: 'Strongest tier with a responder', icon: 'lucideZap' },
    ];
  });
}
