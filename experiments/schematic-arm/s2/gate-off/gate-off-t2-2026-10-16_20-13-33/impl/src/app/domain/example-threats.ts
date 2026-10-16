import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. These threats are invented for the Hero Ops Console demo and describe no
 * real place or group. They seed the in-memory `ThreatService`.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', name: 'Cinder Court', region: 'Old Quarter', tier: 'Tier 2' },
  { id: 'THR-104', name: 'Glass Leviathan', region: 'Harbor', tier: 'Tier 4' },
  { id: 'THR-107', name: 'The Quiet Signal', region: 'Uptown', tier: 'Tier 3' },
  { id: 'THR-112', name: 'Hollow Choir', region: 'Rail Yards', tier: 'Tier 5' },
  { id: 'THR-118', name: 'Mirror Syndicate', region: 'Midtown', tier: 'Tier 3' },
  { id: 'THR-121', name: 'Ashfall', region: 'Northern Ridge', tier: 'Tier 4' },
];
