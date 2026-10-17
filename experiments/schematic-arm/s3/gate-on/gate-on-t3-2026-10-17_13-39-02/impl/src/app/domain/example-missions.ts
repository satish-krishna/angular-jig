import type { Mission } from './mission';

// The cycle the console is running. Launched missions are logged against it.
export const CURRENT_CYCLE = 'Cycle 14';

// EXAMPLE DATA. These missions are invented for the Hero Ops Console demo, held in memory by MissionService.
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0301', codename: 'Harbor Breach', heroId: 'HRO-0040', status: 'Failed', threatTier: 4, cycle: 'Cycle 13' },
  { id: 'MSN-0302', codename: 'Skyline Extraction', heroId: 'HRO-0007', status: 'Succeeded', threatTier: 3, cycle: 'Cycle 13' },
  { id: 'MSN-0303', codename: 'Reactor Sweep', heroId: 'HRO-0012', status: 'Succeeded', threatTier: 5, cycle: 'Cycle 13' },
  { id: 'MSN-0304', codename: 'Quiet Hallway', heroId: 'HRO-0021', status: 'Succeeded', threatTier: 2, cycle: 'Cycle 14' },
  { id: 'MSN-0305', codename: 'Tidewall Relay', heroId: 'HRO-0044', status: 'Live', threatTier: 2, cycle: 'Cycle 14' },
  { id: 'MSN-0306', codename: 'Ember Stack Fire', heroId: 'HRO-0063', status: 'Live', threatTier: 3, cycle: 'Cycle 14' },
  { id: 'MSN-0307', codename: 'Meridian Summit', heroId: 'HRO-0081', status: 'Succeeded', threatTier: 4, cycle: 'Cycle 14' },
  { id: 'MSN-0308', codename: 'Grid Lockdown', heroId: 'HRO-0075', status: 'Succeeded', threatTier: 3, cycle: 'Cycle 14' },
];
