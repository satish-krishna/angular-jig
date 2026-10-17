import type { Mission } from './mission.model';

/**
 * Example data. Not real records.
 */
export const EXAMPLE_MISSIONS: Mission[] = [
  { id: 'M-101', heroId: '10', threatId: 'T-02', outcome: 'Failed', cycle: 38 },
  { id: 'M-102', heroId: '5', threatId: 'T-01', outcome: 'Partial', cycle: 39 },
  { id: 'M-103', heroId: '1', threatId: 'T-06', outcome: 'Success', cycle: 40 },
  { id: 'M-104', heroId: '2', threatId: 'T-03', outcome: 'Active', cycle: 41 },
  { id: 'M-105', heroId: '4', threatId: 'T-05', outcome: 'Active', cycle: 41 },
  { id: 'M-106', heroId: '11', threatId: 'T-04', outcome: 'Success', cycle: 37 },
];
