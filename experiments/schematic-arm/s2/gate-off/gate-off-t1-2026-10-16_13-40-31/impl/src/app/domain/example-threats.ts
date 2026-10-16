import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. The threat board is invented for the Hero Ops Console demo.
 * Nothing here reflects a real incident.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', name: 'Riverside flood surge', region: 'Harbor District', tier: 2, status: 'Contained', summary: 'Levee pumps holding. Monitor overnight.' },
  { id: 'THR-102', name: 'Rogue reactor drift', region: 'Northern Grid', tier: 4, status: 'Escalating', summary: 'Core temperature climbing. Evacuation on standby.' },
  { id: 'THR-103', name: 'Dimensional tear', region: 'Border Sector', tier: 5, status: 'Open', summary: 'Anomaly widening. Keep clear of the border sector.' },
  { id: 'THR-104', name: 'Syndicate drone fleet', region: 'Port Authority', tier: 3, status: 'Open', summary: 'Drones surveying cargo berths. Intercept teams assigned.' },
  { id: 'THR-105', name: 'Power-dampener network', region: 'Eastside', tier: 3, status: 'Escalating', summary: 'Three dampener relays found. Two still active.' },
  { id: 'THR-106', name: 'Ransomware on the civic grid', region: 'Civic Network', tier: 2, status: 'Contained', summary: 'Systems isolated and restored. Post-incident audit open.' },
];
