import type { Mission } from './mission.model';
import type { Threat } from './threat.model';

/** EXAMPLE DATA. Fictional threats and deployments for the Hero Ops Console demo. */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-01', name: 'Sentinel Array breach', region: 'Northern Grid', tier: 4, status: 'Open' },
  { id: 'THR-02', name: 'Hollow Tide', region: 'Harbor District', tier: 2, status: 'Contained' },
  { id: 'THR-03', name: 'Glass Colossus', region: 'Old Quarter', tier: 5, status: 'Open' },
  { id: 'THR-04', name: 'Signal Ghost', region: 'Metro Rail', tier: 3, status: 'Open' },
  { id: 'THR-05', name: 'Ember Swarm', region: 'Riverside', tier: 3, status: 'Contained' },
  { id: 'THR-06', name: 'Null Cascade', region: 'Data Exchange', tier: 4, status: 'Open' },
];

/** EXAMPLE DATA. The deployment log the example roster starts with. */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0001', heroId: 'HRO-0007', threatId: 'THR-01', status: 'Succeeded' },
  { id: 'MSN-0002', heroId: 'HRO-0012', threatId: 'THR-03', status: 'Succeeded' },
  { id: 'MSN-0003', heroId: 'HRO-0033', threatId: 'THR-06', status: 'Live' },
  { id: 'MSN-0004', heroId: 'HRO-0021', threatId: 'THR-04', status: 'Failed' },
  { id: 'MSN-0005', heroId: 'HRO-0044', threatId: 'THR-05', status: 'Succeeded' },
  { id: 'MSN-0006', heroId: 'HRO-0063', threatId: 'THR-04', status: 'Live' },
];
