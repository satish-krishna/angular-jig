import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. Five live missions for the demo, each sent on an Active hero from the
 * example roster. They are invented for the Hero Ops Console and are not real operations.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0101', codename: 'Harbor Sweep', heroId: 'HRO-0007', district: 'Harbor District', objective: 'Aerial perimeter sweep after the Harbor Breach.' },
  { id: 'MSN-0102', codename: 'Glass Tower', heroId: 'HRO-0012', district: 'Midtown', objective: 'Extract civilians from the Glass Tower.' },
  { id: 'MSN-0103', codename: 'Undercut', heroId: 'HRO-0044', district: 'Rail Yards', objective: 'Drone survey of the tunnel network.' },
  { id: 'MSN-0104', codename: 'East Gate', heroId: 'HRO-0075', district: 'Port Authority', objective: 'Hold the east gate until relief arrives.' },
  { id: 'MSN-0105', codename: 'Night Market', heroId: 'HRO-0051', district: 'Old Quarter', objective: 'De-escalate the crowd at the night market.' },
];
