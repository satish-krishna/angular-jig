import type { Mission } from './mission.model';

/** The first mission number issued after the example records. */
export const FIRST_MISSION_NUMBER = 109;

/**
 * EXAMPLE DATA. These deployments are invented for the Hero Ops Console demo and
 * do not describe real operations. Listed oldest first.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MS-101', heroId: 'HO-001', target: 'Harbour dome breach', outcome: 'Success' },
  { id: 'MS-102', heroId: 'HO-002', target: 'Reactor overload, Sector 7', outcome: 'Success' },
  { id: 'MS-103', heroId: 'HO-008', target: 'Rift containment, Lowell Bridge', outcome: 'Failed' },
  { id: 'MS-104', heroId: 'HO-003', target: 'Riot control, Eastgate', outcome: 'Partial' },
  { id: 'MS-105', heroId: 'HO-005', target: 'Cosmic anomaly tracking', outcome: 'In progress' },
  { id: 'MS-106', heroId: 'HO-010', target: 'Psionic broadcast intercept', outcome: 'Success' },
  { id: 'MS-107', heroId: 'HO-012', target: 'Grid sabotage, Meridian ward', outcome: 'Success' },
  { id: 'MS-108', heroId: 'HO-004', target: 'Flood barrier collapse', outcome: 'Partial' },
];
