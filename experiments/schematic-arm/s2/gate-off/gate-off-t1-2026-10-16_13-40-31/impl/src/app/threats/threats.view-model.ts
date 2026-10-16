import { Injectable } from '@angular/core';
import { EXAMPLE_THREATS } from '../domain/example-threats';
import type { ThreatStatus, Threat } from '../domain/threat.model';

/** Badge look for each threat status. */
const STATUS_VARIANTS: Record<ThreatStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Open: 'outline',
  Escalating: 'destructive',
  Contained: 'secondary',
};

/** Summarises the threat board. Threats are reference data, so there is nothing to write. Component-scoped; no DOM. */
@Injectable()
export class ThreatsViewModel {
  /** Most severe tier first, then by name. */
  readonly threats: readonly Threat[] = [...EXAMPLE_THREATS].sort(
    (a, b) => b.tier - a.tier || a.name.localeCompare(b.name),
  );

  readonly openCount = EXAMPLE_THREATS.filter((threat) => threat.status !== 'Contained').length;

  readonly escalatingCount = EXAMPLE_THREATS.filter((threat) => threat.status === 'Escalating').length;

  readonly highestTier = Math.max(...EXAMPLE_THREATS.map((threat) => threat.tier));

  statusVariant(status: ThreatStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    return STATUS_VARIANTS[status];
  }
}
