import type { Mission } from './mission.model';

/** Example data. Hero ids refer to EXAMPLE_HEROES; threat ids to EXAMPLE_THREATS. */
export const EXAMPLE_MISSIONS: Mission[] = [
  { id: '1', codename: 'Tidebreaker', objective: 'Halt the Leviathan Bloom at the shelf', status: 'Active', priority: true, threatId: '1', heroIds: ['1', '3'], startedOn: '2026-08-02', debrief: '' },
  { id: '2', codename: 'Cold Ledger', objective: 'Trace Gilded Hand financing', status: 'Active', priority: false, threatId: '2', heroIds: ['6'], startedOn: '2026-07-19', debrief: '' },
  { id: '3', codename: 'Quiet Lattice', objective: 'Maintain the Atacama containment', status: 'Complete', priority: false, threatId: '3', heroIds: ['2', '5'], startedOn: '2026-02-04', debrief: 'Containment held. No casualties.' },
  { id: '4', codename: 'Warden Recall', objective: 'Bring Warden Prime in without escalation', status: 'Planned', priority: true, threatId: '4', heroIds: [], startedOn: '2026-09-01', debrief: '' },
  { id: '5', codename: 'Long Listen', objective: 'Characterize the Hollow Star signal', status: 'Active', priority: true, threatId: '5', heroIds: ['4'], startedOn: '2026-07-22', debrief: '' },
  { id: '6', codename: 'Chorus End', objective: 'Stand down the Reykjavik response', status: 'Aborted', priority: false, threatId: null, heroIds: ['7'], startedOn: '2025-09-10', debrief: 'Stood down; threat self-resolved.' },
];
