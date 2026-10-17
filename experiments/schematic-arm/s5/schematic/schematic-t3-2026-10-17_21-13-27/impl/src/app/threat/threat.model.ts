import type { HeroClearance } from '../hero/hero.model';

export type ThreatStatus = 'Open' | 'Contained' | 'Resolved';

export interface Threat {
  readonly id: string;
  readonly title: string;
  readonly location: string;
  /** The clearance a responding hero needs before deployment. */
  readonly requiredClearance: HeroClearance;
  readonly status: ThreatStatus;
}
