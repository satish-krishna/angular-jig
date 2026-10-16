import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. Six threats for the demo. They are invented for the Hero Ops Console and
 * are not real incidents.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-0001', title: 'Tidal surge sabotage', district: 'Harbor District', tier: 4, status: 'Open' },
  { id: 'THR-0002', title: 'Ion-grid blackout', district: 'Midtown', tier: 3, status: 'Open' },
  { id: 'THR-0003', title: 'Mutant pack in the rail yards', district: 'Rail Yards', tier: 3, status: 'Open' },
  { id: 'THR-0004', title: 'Rogue drone swarm', district: 'Old Quarter', tier: 2, status: 'Contained' },
  { id: 'THR-0005', title: 'Psionic broadcast in shelters', district: 'Eastside', tier: 5, status: 'Open' },
  { id: 'THR-0006', title: 'Rift opening at the stadium', district: 'Stadium Row', tier: 4, status: 'Contained' },
];
