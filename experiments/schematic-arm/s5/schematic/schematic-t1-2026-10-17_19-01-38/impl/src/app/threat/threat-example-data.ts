import type { Threat } from './threat.model';

/**
 * Example data. Not real records.
 */
export const EXAMPLE_THREATS: Threat[] = [
  { id: 'T-01', name: 'Harbor Breach', tier: 4, location: 'Port Ardent docks', status: 'Open' },
  { id: 'T-02', name: 'Nightfall Syndicate', tier: 3, location: 'Eastside rail yard', status: 'Open' },
  { id: 'T-03', name: 'Hollow Signal', tier: 5, location: 'Northfield relay', status: 'Engaged' },
  { id: 'T-04', name: 'Glass Choir', tier: 2, location: 'Civic plaza', status: 'Contained' },
  { id: 'T-05', name: 'Ferrous Tide', tier: 3, location: 'Harbor flood gates', status: 'Engaged' },
  { id: 'T-06', name: 'Quiet Engine', tier: 1, location: 'Warehouse 9', status: 'Contained' },
];
