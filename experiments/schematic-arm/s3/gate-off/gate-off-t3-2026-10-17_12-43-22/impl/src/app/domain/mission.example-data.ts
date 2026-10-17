import type { Mission } from './mission.model';

// EXAMPLE DATA. Invented missions for the demo. Hero IDs match the example roster.
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0101', codename: 'Glasshouse', heroId: 'HRO-0007', threatTier: 3, status: 'Complete', location: 'Downtown ferry terminal' },
  { id: 'MSN-0102', codename: 'Cinder Line', heroId: 'HRO-0063', threatTier: 2, status: 'Complete', location: 'Harbor warehouse' },
  { id: 'MSN-0103', codename: 'Blackout Relay', heroId: 'HRO-0012', threatTier: 5, status: 'In progress', location: 'Grid substation 9' },
  { id: 'MSN-0104', codename: 'Quiet Orbit', heroId: 'HRO-0033', threatTier: 5, status: 'Planned', location: 'Low orbit station' },
  { id: 'MSN-0105', codename: 'Static Bloom', heroId: 'HRO-0051', threatTier: 4, status: 'Complete', location: 'Riverside hospital' },
  { id: 'MSN-0106', codename: 'Tin Mountain', heroId: 'HRO-0044', threatTier: 2, status: 'Failed', location: 'Foundry district' },
  { id: 'MSN-0107', codename: 'Zero Tide', heroId: 'HRO-0075', threatTier: 4, status: 'Planned', location: 'Coastal barrier' },
  { id: 'MSN-0108', codename: 'Night Crane', heroId: 'HRO-0081', threatTier: 3, status: 'In progress', location: 'Museum vault' },
];
