import type { Threat } from './threat';

/**
 * EXAMPLE DATA. These threats are invented for the Hero Ops Console demo and do not
 * describe real events, places, or people. There is no backend behind them.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', title: 'Null Signal Outage', sector: 'Northern relay', tier: 5, status: 'Open', summary: 'A cascading blackout across the northern relay towers. Suspected directed-energy interference.', assignedHeroIds: ['HRO-0033', 'HRO-0012'] },
  { id: 'THR-102', title: 'Skyline Drone Swarm', sector: 'Downtown grid', tier: 3, status: 'Open', summary: 'Unregistered drones circling the financial district at low altitude.', assignedHeroIds: ['HRO-0007', 'HRO-0044'] },
  { id: 'THR-103', title: 'Harbor Breach', sector: 'Eastern docks', tier: 4, status: 'Contained', summary: 'A forced entry at the eastern docks. Perimeter held; cleanup under way.', assignedHeroIds: ['HRO-0007', 'HRO-0044'] },
  { id: 'THR-104', title: 'Rift Sightings', sector: 'Quarry district', tier: 2, status: 'Open', summary: 'Repeated spatial distortions reported near the old quarry. No casualties so far.', assignedHeroIds: ['HRO-0021'] },
  { id: 'THR-105', title: 'Ember Market Fire', sector: 'Old town', tier: 1, status: 'Closed', summary: 'A contained fire in a market hall. Closed after the inspection report.', assignedHeroIds: [] },
  { id: 'THR-106', title: 'Grond Quarry Collapse', sector: 'Quarry district', tier: 4, status: 'Open', summary: 'Ground instability under the quarry road. Heavy-lift support requested.', assignedHeroIds: ['HRO-0063', 'HRO-0081'] },
];
