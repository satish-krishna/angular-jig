import type { Threat } from './threat.model';

/** Example threats. Not real incidents. */
export const EXAMPLE_THREATS: Threat[] = [
  {
    id: 't1',
    title: 'Harbor Breach',
    location: 'Pier 9, Harbor District',
    requiredClearance: 'Tier 4',
    status: 'Open',
  },
  {
    id: 't2',
    title: 'Vault Intrusion',
    location: 'Meridian Archive',
    requiredClearance: 'Tier 5',
    status: 'Open',
  },
  {
    id: 't3',
    title: 'Grid Overload',
    location: 'Substation 14',
    requiredClearance: 'Tier 2',
    status: 'Open',
  },
  {
    id: 't4',
    title: 'Skyline Drone Swarm',
    location: 'Financial District',
    requiredClearance: 'Tier 3',
    status: 'Contained',
  },
  {
    id: 't5',
    title: 'Rogue Automaton',
    location: 'Eastbank Rail Yard',
    requiredClearance: 'Tier 3',
    status: 'Resolved',
  },
];
