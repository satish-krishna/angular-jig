import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. These deployments are invented for the Hero Ops Console demo.
 * Hero totals on the roster are separate figures and are not derived from this log.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MIS-001', heroId: 'silverwing', threatId: 'sable-syndicate', outcome: 'Success', launched: '2026-09-02' },
  { id: 'MIS-002', heroId: 'dr-ion', threatId: 'iron-meridian', outcome: 'Partial', launched: '2026-09-05' },
  { id: 'MIS-003', heroId: 'magnetar', threatId: 'iron-meridian', outcome: 'Success', launched: '2026-09-11' },
  { id: 'MIS-004', heroId: 'aurora-vale', threatId: 'the-quiet-hour', outcome: 'Success', launched: '2026-09-19' },
  { id: 'MIS-005', heroId: 'ember-cho', threatId: 'ember-cult', outcome: 'Success', launched: '2026-09-27' },
  { id: 'MIS-006', heroId: 'rift', threatId: 'vantage-group', outcome: 'Failed', launched: '2026-10-03' },
  { id: 'MIS-007', heroId: 'halcyon', threatId: 'hollow-signal', outcome: 'Success', launched: '2026-10-08' },
  { id: 'MIS-008', heroId: 'ms-meridian', threatId: 'sable-syndicate', outcome: 'In progress', launched: '2026-10-15' },
];
