import type { ClearanceTier } from './hero.model';
import type { StatusVariant } from './hero-presentation';

/** Threat register states. Open threats still need a response; closed ones do not. */
export const THREAT_STATUSES = ['Open', 'Contained', 'Closed'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

/** Threat status to badge variant. Open is destructive, Contained is warning, Closed is success. */
export const THREAT_STATUS_VARIANT: Readonly<Record<ThreatStatus, StatusVariant>> = {
  Open: 'destructive',
  Contained: 'warning',
  Closed: 'success',
};

export interface Threat {
  readonly id: string;
  readonly name: string;
  /** The clearance tier a response to this threat requires. */
  readonly tier: ClearanceTier;
  readonly status: ThreatStatus;
  readonly location: string;
  readonly summary: string;
}
