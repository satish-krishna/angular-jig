import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. The mission log is invented for the Hero Ops Console capstone and
 * is not a real record. Hero and threat ids refer to the example roster and threats.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-2401', operation: 'Harbor Breach', heroId: 'HRO-0007', threatId: 'THR-101', outcome: 'In progress', cycle: 14 },
  { id: 'MSN-2398', operation: 'Nightfall Relay', heroId: 'HRO-0033', threatId: 'THR-103', outcome: 'Success', cycle: 13 },
  { id: 'MSN-2395', operation: 'Glasshouse Sweep', heroId: 'HRO-0051', threatId: 'THR-102', outcome: 'Success', cycle: 13 },
  { id: 'MSN-2392', operation: 'Stormline Hold', heroId: 'HRO-0012', threatId: 'THR-105', outcome: 'Partial', cycle: 12 },
  { id: 'MSN-2388', operation: 'Ashfall Sweep', heroId: 'HRO-0075', threatId: 'THR-106', outcome: 'Success', cycle: 12 },
  { id: 'MSN-2384', operation: 'Tollway Recon', heroId: 'HRO-0044', threatId: 'THR-104', outcome: 'Success', cycle: 11 },
  { id: 'MSN-2380', operation: 'Night Shift Patrol', heroId: 'HRO-0063', threatId: null, outcome: 'Success', cycle: 11 },
  { id: 'MSN-2377', operation: 'Harbor Breach', heroId: 'HRO-0040', threatId: 'THR-101', outcome: 'Failed', cycle: 10 },
  { id: 'MSN-2372', operation: 'Dockside Escort', heroId: 'HRO-0081', threatId: null, outcome: 'Success', cycle: 10 },
  { id: 'MSN-2369', operation: 'Blackout Extraction', heroId: 'HRO-0070', threatId: 'THR-103', outcome: 'Failed', cycle: 9 },
];
