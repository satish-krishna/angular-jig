import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. Threats are illustrative content for the Hero Ops Console, not real
 * incident reports. They seed the in-memory ThreatService.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', name: 'Dockside smuggling ring', tier: 3, status: 'Open', location: 'Port Meridian', summary: 'Crates of unlicensed power cells moving through the north pier at night.' },
  { id: 'THR-102', name: 'Rogue drone swarm', tier: 4, status: 'Open', location: 'Sector 9 skyline', summary: 'Autonomous units have locked onto the air-traffic corridor. Aerial heroes only.' },
  { id: 'THR-103', name: 'Gravity anomaly', tier: 5, status: 'Open', location: 'Lake Halvard', summary: 'A localised pull strong enough to lift vehicles. Reserved for tier-5 response.' },
  { id: 'THR-104', name: 'Psionic broadcast', tier: 4, status: 'Open', location: 'Civic Center', summary: 'A signal is overriding crowd behaviour during the council session. De-escalation first.' },
  { id: 'THR-105', name: 'Refinery sabotage', tier: 2, status: 'Open', location: 'Refinery Row', summary: 'Valve tampering reported on two lines. Ground teams to inspect before restart.' },
  { id: 'THR-106', name: 'Cryo-ransom crew', tier: 3, status: 'Open', location: 'Northgate', summary: 'Hostage demands for a cold-storage depot. Negotiation channel is open.' },
  { id: 'THR-107', name: 'Unlicensed exosuit', tier: 1, status: 'Open', location: 'Eastfield', summary: 'A rig with no registration is operating near a school. Low risk, needs a unit on site.' },
  { id: 'THR-098', name: 'Nightfall residue', tier: 5, status: 'Contained', location: 'Old Quarry', summary: 'Null-field residue left after Operation Nightfall. Perimeter holding.' },
  { id: 'THR-090', name: 'Central Line device', tier: 3, status: 'Resolved', location: 'Central Line', summary: 'Device disarmed and removed. Case closed pending the final report.' },
];
