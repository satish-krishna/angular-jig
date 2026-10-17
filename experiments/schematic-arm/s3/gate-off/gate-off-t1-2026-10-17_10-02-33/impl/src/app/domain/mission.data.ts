import type { Mission } from './mission.model';

// EXAMPLE DATA. Deployments invented for the Hero Ops Console demo.
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0101', heroId: 'HRO-0012', threatId: 'THR-03', status: 'Won' },
  { id: 'MSN-0102', heroId: 'HRO-0033', threatId: 'THR-03', status: 'Won' },
  { id: 'MSN-0103', heroId: 'HRO-0007', threatId: 'THR-02', status: 'Won' },
  { id: 'MSN-0104', heroId: 'HRO-0051', threatId: 'THR-01', status: 'Lost' },
  { id: 'MSN-0105', heroId: 'HRO-0040', threatId: 'THR-01', status: 'Won' },
  { id: 'MSN-0106', heroId: 'HRO-0012', threatId: 'THR-02', status: 'Live' },
  { id: 'MSN-0107', heroId: 'HRO-0007', threatId: 'THR-01', status: 'Live' },
];
