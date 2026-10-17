import type { Threat } from './threat';

// EXAMPLE DATA. These threat assessments are invented for the Hero Ops Console demo and are read-only.
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-0101', name: 'Harbor Breach, second wave', zone: 'Port district', tier: 4, status: 'Escalated' },
  { id: 'THR-0102', name: 'Reactor core instability', zone: 'Eastgate power plant', tier: 5, status: 'Open' },
  { id: 'THR-0103', name: 'Rogue drone swarm', zone: 'Financial quarter', tier: 3, status: 'Open' },
  { id: 'THR-0104', name: 'Summit signal jamming', zone: 'Meridian ridge', tier: 2, status: 'Contained' },
  { id: 'THR-0105', name: 'Unregistered energy signature', zone: 'Old rail yard', tier: 3, status: 'Contained' },
  { id: 'THR-0106', name: 'Grid overload cascade', zone: 'Northern substations', tier: 4, status: 'Open' },
];
