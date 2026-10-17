import type { Threat } from './threat.model';

// EXAMPLE DATA. These threats are invented for the Hero Ops Console demo. They are not real incidents.
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-01', name: 'The Mirror Syndicate', region: 'Northeast Metro', tier: 4, status: 'Active' },
  { id: 'THR-02', name: 'Tidewrack', region: 'Coastal Belt', tier: 3, status: 'Active' },
  { id: 'THR-03', name: 'Iron Choir', region: 'Foundry District', tier: 5, status: 'Active' },
  { id: 'THR-04', name: 'Blackout Cell', region: 'Harbor Grid', tier: 2, status: 'Contained' },
  { id: 'THR-05', name: 'Glass Titan', region: 'Old Quarter', tier: 4, status: 'Monitoring' },
  { id: 'THR-06', name: 'Sable Moth', region: 'Airport Corridor', tier: 3, status: 'Monitoring' },
];

export function threatById(id: string): Threat | undefined {
  return EXAMPLE_THREATS.find((threat) => threat.id === id);
}

// The threat a new deployment is aimed at: the highest-tier threat that is still active.
export function mostUrgentThreat(): Threat | undefined {
  return EXAMPLE_THREATS.filter((threat) => threat.status === 'Active').sort((a, b) => b.tier - a.tier)[0];
}
