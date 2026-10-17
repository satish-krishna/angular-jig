import { computed, inject, Injectable } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { EXAMPLE_INCIDENTS } from '../domain/example-incidents';
import { HeroService } from '../domain/hero.service';
import { THREAT_TIERS, type IncidentStatus, type ThreatTier } from '../domain/incidents';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface ThreatStat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: StatIcon;
}

export interface IncidentRow {
  readonly id: string;
  readonly title: string;
  readonly tier: ThreatTier;
  readonly tierVariant: BadgeVariants['variant'];
  readonly status: IncidentStatus;
  readonly statusVariant: BadgeVariants['variant'];
  readonly location: string;
  readonly reportedOn: string;
  readonly responder: string;
}

const TIER_VARIANT: Readonly<Record<ThreatTier, BadgeVariants['variant']>> = {
  Minor: 'outline',
  Moderate: 'secondary',
  Serious: 'warning',
  Severe: 'destructive',
  Catastrophic: 'destructive',
};

const INCIDENT_STATUS_VARIANT: Readonly<Record<IncidentStatus, BadgeVariants['variant']>> = {
  Open: 'destructive',
  Contained: 'warning',
  Closed: 'success',
};

const SEVERE_OR_WORSE: readonly ThreatTier[] = ['Severe', 'Catastrophic'];

@Injectable() // no providedIn: scoped to the Threats component that provides it
export class ThreatsViewModel {
  private readonly heroService = inject(HeroService);

  // The incident log is example data. Responders resolve against the live roster, so a
  // retired hero shows as unassigned here too.
  private readonly incidents = EXAMPLE_INCIDENTS;
  private readonly openIncidents = this.incidents.filter((incident) => incident.status === 'Open');

  readonly stats = computed<readonly ThreatStat[]>(() => {
    const onRoster = new Set(this.heroService.list().map((hero) => hero.id));
    const responders = new Set(
      this.openIncidents
        .map((incident) => incident.assignedHeroId)
        .filter((id): id is string => id !== null && onRoster.has(id)),
    );
    const severe = this.openIncidents.filter((incident) => SEVERE_OR_WORSE.includes(incident.tier));

    return [
      {
        id: 'open',
        label: 'Open incidents',
        value: String(this.openIncidents.length),
        detail: `${this.incidents.length} logged in total`,
        icon: 'lucideShieldAlert',
      },
      {
        id: 'severe',
        label: 'Severe or worse',
        value: String(severe.length),
        detail: 'Open, severe tier and above',
        icon: 'lucideZap',
      },
      {
        id: 'responders',
        label: 'Heroes responding',
        value: String(responders.size),
        detail: 'Assigned to an open incident',
        icon: 'lucideUserCheck',
      },
    ];
  });

  // Most severe first.
  readonly rows = computed<readonly IncidentRow[]>(() => {
    const roster = this.heroService.list();
    const responderName = (heroId: string | null): string =>
      roster.find((hero) => hero.id === heroId)?.name ?? 'Unassigned';

    return [...this.incidents]
      .sort((a, b) => THREAT_TIERS.indexOf(b.tier) - THREAT_TIERS.indexOf(a.tier))
      .map((incident) => ({
        id: incident.id,
        title: incident.title,
        tier: incident.tier,
        tierVariant: TIER_VARIANT[incident.tier],
        status: incident.status,
        statusVariant: INCIDENT_STATUS_VARIANT[incident.status],
        location: incident.location,
        reportedOn: incident.reportedOn,
        responder: responderName(incident.assignedHeroId),
      }));
  });
}
