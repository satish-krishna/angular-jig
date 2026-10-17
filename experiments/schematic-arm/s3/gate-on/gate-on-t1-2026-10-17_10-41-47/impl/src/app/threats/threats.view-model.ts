import { computed, inject, Injectable } from '@angular/core';
import { CLEARANCE_TIERS } from '../domain/hero.model';
import type { Threat } from '../domain/threat.model';
import { THREAT_STATUS_VARIANT } from '../domain/threat.model';
import { ThreatService } from '../domain/threat.service';

/** Component-scoped ViewModel for the Threats screen: the threat register, highest clearance first. */
@Injectable()
export class ThreatsViewModel {
  private readonly _threats = inject(ThreatService);

  /** Threat status to badge variant, read by each card. */
  readonly statusVariant = THREAT_STATUS_VARIANT;

  /** Highest clearance tier first. Ties keep register order. */
  readonly threats = computed<readonly Threat[]>(() =>
    this._threats
      .register()
      .slice()
      .sort((a, b) => CLEARANCE_TIERS.indexOf(b.tier) - CLEARANCE_TIERS.indexOf(a.tier)),
  );

  readonly total = computed(() => this._threats.register().length);

  readonly open = computed(() => this._threats.register().filter((threat) => threat.status === 'Open').length);
}
