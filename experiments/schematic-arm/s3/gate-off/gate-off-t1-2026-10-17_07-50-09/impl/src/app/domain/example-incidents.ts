import type { Incident } from './incidents';

/**
 * EXAMPLE DATA. These incidents are invented for the Hero Ops Console demo. Responder
 * IDs point at the example roster, so a retired hero simply shows as unassigned.
 */
export const EXAMPLE_INCIDENTS: readonly Incident[] = [
  {
    id: 'INC-2041',
    title: 'Reactor leak at the east docks',
    tier: 'Catastrophic',
    status: 'Open',
    location: 'Harbour district',
    reportedOn: '2026-10-14',
    assignedHeroId: 'HRO-0012',
  },
  {
    id: 'INC-2038',
    title: 'Rogue drone swarm over the stadium',
    tier: 'Severe',
    status: 'Open',
    location: 'Midtown',
    reportedOn: '2026-10-13',
    assignedHeroId: 'HRO-0044',
  },
  {
    id: 'INC-2036',
    title: 'Vault breach at the mint',
    tier: 'Severe',
    status: 'Open',
    location: 'Old quarter',
    reportedOn: '2026-10-13',
    assignedHeroId: null,
  },
  {
    id: 'INC-2033',
    title: 'Signal jamming near the airport',
    tier: 'Serious',
    status: 'Open',
    location: 'Airfield',
    reportedOn: '2026-10-12',
    assignedHeroId: 'HRO-0007',
  },
  {
    id: 'INC-2029',
    title: 'Missing courier, last seen on the rooftops',
    tier: 'Moderate',
    status: 'Contained',
    location: 'Skyline',
    reportedOn: '2026-10-10',
    assignedHeroId: 'HRO-0063',
  },
  {
    id: 'INC-2025',
    title: 'Gas main flare-up under the bridge',
    tier: 'Serious',
    status: 'Contained',
    location: 'Riverside',
    reportedOn: '2026-10-08',
    assignedHeroId: 'HRO-0075',
  },
  {
    id: 'INC-2019',
    title: 'Unlicensed psionic broadcast',
    tier: 'Minor',
    status: 'Closed',
    location: 'Uptown',
    reportedOn: '2026-10-02',
    assignedHeroId: 'HRO-0051',
  },
];
