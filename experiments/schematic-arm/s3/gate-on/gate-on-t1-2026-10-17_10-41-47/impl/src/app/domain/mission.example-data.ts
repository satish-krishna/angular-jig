import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. Fictional deployments for the Hero Ops Console demo, keyed to the example
 * roster and threat register. Nothing here is a real operation or record.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0301', name: 'Operation Nightfall', threatId: 'THR-102', heroIds: ['HRO-0007', 'HRO-0070'], date: '2026-09-14', outcome: 'Partial' },
  { id: 'MSN-0302', name: 'Harbor Breach response', threatId: 'THR-101', heroIds: ['HRO-0040', 'HRO-0044', 'HRO-0012'], date: '2026-09-30', outcome: 'Success' },
  { id: 'MSN-0303', name: 'Skyline interception', threatId: 'THR-104', heroIds: ['HRO-0012', 'HRO-0033'], date: '2026-10-05', outcome: 'In progress' },
  { id: 'MSN-0304', name: 'Foundry reconnaissance', threatId: 'THR-103', heroIds: ['HRO-0021'], date: '2026-08-21', outcome: 'Success' },
  { id: 'MSN-0305', name: 'Signal Storm containment', threatId: 'THR-105', heroIds: ['HRO-0058'], date: '2026-10-11', outcome: 'Failed' },
  { id: 'MSN-0306', name: 'Ember perimeter sweep', threatId: 'THR-102', heroIds: ['HRO-0063', 'HRO-0051'], date: '2026-10-14', outcome: 'In progress' },
];
