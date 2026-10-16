import { Service, signal } from '@angular/core';
import type { Threat } from './threat';

/**
 * EXAMPLE DATA. These threat reports are illustrative content for the Hero Ops Console, not
 * real intelligence. There is no backend: ThreatService holds them as in-memory signal state.
 */
const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', title: 'Harbour rig sabotage', region: 'Port Ardent', level: 'Critical', status: 'Open', summary: 'Armed crew disabling offshore power relays. Response team en route.' },
  { id: 'THR-102', title: 'Stolen particle accelerator', region: 'Northgate Labs', level: 'High', status: 'Monitoring', summary: 'Prototype core moved across state lines. Tracking the transport.' },
  { id: 'THR-103', title: 'Subway ceiling collapse', region: 'Central Transit', level: 'High', status: 'Open', summary: 'Structural failure traced to a telekinetic saboteur. Sectors sealed.' },
  { id: 'THR-104', title: 'Rogue drone swarm', region: 'Eastbridge', level: 'Moderate', status: 'Contained', summary: 'Swarm grounded and the controller identified. Cleanup in progress.' },
  { id: 'THR-105', title: 'Counterfeit clearance badges', region: 'Civic Plaza', level: 'Low', status: 'Monitoring', summary: 'Forged Tier 2 badges circulating. No hero access was obtained.' },
  { id: 'THR-106', title: 'Glacier beacon interference', region: 'Arctic Relay', level: 'Moderate', status: 'Open', summary: 'Signal jamming near the relay station. Cause still unknown.' },
  { id: 'THR-107', title: 'Warehouse containment breach', region: 'Docklands', level: 'High', status: 'Contained', summary: 'Breach sealed and the escaped specimen recovered without injury.' },
];

/**
 * In-memory threat board over the example reports. Singleton, root-provided by `@Service()`.
 */
@Service()
export class ThreatService {
  /** The threat reports. Read it inside a computed() or template to stay reactive. */
  readonly threats = signal<readonly Threat[]>(EXAMPLE_THREATS).asReadonly();
}
