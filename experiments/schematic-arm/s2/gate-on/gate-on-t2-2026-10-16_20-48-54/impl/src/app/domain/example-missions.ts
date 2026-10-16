import type { Mission } from './mission';

/** EXAMPLE DATA. Fictional operations for the Hero Ops Console demo. Newest first. */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'OP-2207', title: 'Vault Relay Audit', threatTier: 1, heroIds: ['HRO-0070'], outcome: 'In progress' },
  { id: 'OP-2206', title: 'Grid Blackout Recovery', threatTier: 2, heroIds: ['HRO-0044', 'HRO-0063'], outcome: 'Failed' },
  { id: 'OP-2205', title: 'Aurora Tide Response', threatTier: 5, heroIds: ['HRO-0033', 'HRO-0012'], outcome: 'Partial' },
  { id: 'OP-2204', title: 'Quarry Fire Containment', threatTier: 3, heroIds: ['HRO-0012', 'HRO-0058'], outcome: 'Success' },
  { id: 'OP-2203', title: 'Null Signal Sweep', threatTier: 3, heroIds: ['HRO-0021', 'HRO-0051'], outcome: 'Success' },
  { id: 'OP-2202', title: 'Skyline Extraction', threatTier: 2, heroIds: ['HRO-0007'], outcome: 'Success' },
  { id: 'OP-2201', title: 'Harbor Breach', threatTier: 4, heroIds: ['HRO-0040', 'HRO-0007'], outcome: 'Partial' },
];
