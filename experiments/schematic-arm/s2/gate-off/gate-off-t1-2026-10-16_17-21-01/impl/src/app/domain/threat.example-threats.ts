import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. The threats are invented for the Hero Ops Console demo and are not
 * backed by any feed. They are read-only: the console does not yet log threat activity.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', name: 'Tidewall Syndicate', region: 'Harbor District', tier: 3, status: 'Open', summary: 'Smuggling rings using sealed cargo to move enhanced contraband.' },
  { id: 'THR-114', name: 'Crimson Quorum', region: 'Old Financial Quarter', tier: 5, status: 'Open', summary: 'A psionic cell attempting to breach the central vault network.' },
  { id: 'THR-122', name: 'Glass Foundry', region: 'Industrial Belt', tier: 4, status: 'Monitoring', summary: 'An unlicensed energy works drawing unstable power from the grid.' },
  { id: 'THR-130', name: 'Hollow Choir', region: 'Northern Reach', tier: 2, status: 'Contained', summary: 'A broadcast interference ring, now jammed and under watch.' },
  { id: 'THR-137', name: 'Ashfall Crew', region: 'Eastern Highway', tier: 3, status: 'Open', summary: 'Armed raiders targeting relief convoys along the eastern corridor.' },
  { id: 'THR-145', name: 'Orbital Null', region: 'Upper Atmosphere', tier: 5, status: 'Monitoring', summary: 'An unidentified signal tracked in high orbit. Origin unconfirmed.' },
];
