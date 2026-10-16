import type { Threat } from './threat';

/** EXAMPLE DATA. Fictional watch list for the Hero Ops Console demo. */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-01', name: 'Harbor Hive Syndicate', tier: 4, region: 'Port district', status: 'Engaged' },
  { id: 'THR-02', name: 'Aurora Tide Anomaly', tier: 5, region: 'Coastal shelf', status: 'Monitoring' },
  { id: 'THR-03', name: 'Grid Saboteur Cell', tier: 2, region: 'Eastern substation', status: 'Contained' },
  { id: 'THR-04', name: 'Quarry Fire Cluster', tier: 3, region: 'Ridge quarry', status: 'Contained' },
  { id: 'THR-05', name: 'Null Signal Broadcaster', tier: 3, region: 'Midtown relay', status: 'Engaged' },
  { id: 'THR-06', name: 'Rogue Drone Swarm', tier: 2, region: 'Airspace west', status: 'Monitoring' },
  { id: 'THR-07', name: 'Vault Intrusion Crew', tier: 1, region: 'Financial quarter', status: 'Monitoring' },
];
