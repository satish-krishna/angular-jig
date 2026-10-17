import type { Mission } from './mission.model';

/**
 * Example missions. Not real operations. Hero ids match the example roster in
 * src/app/hero/hero-example-data.ts.
 */
export const EXAMPLE_MISSIONS: Mission[] = [
  {
    id: 'm1',
    operation: 'Harbor Extraction',
    heroIds: ['1'],
    launched: '02 Aug 2026',
    status: 'Closed',
    outcome: 'Success',
  },
  {
    id: 'm2',
    operation: 'Skyline Recon',
    heroIds: ['1'],
    launched: '14 Jul 2026',
    status: 'Closed',
    outcome: 'Partial',
  },
  {
    id: 'm3',
    operation: 'Grid Stabilisation',
    heroIds: ['2'],
    launched: '21 Jul 2026',
    status: 'Closed',
    outcome: 'Success',
  },
  {
    id: 'm4',
    operation: 'Tier-5 Containment',
    heroIds: ['4'],
    launched: '09 Aug 2026',
    status: 'Closed',
    outcome: 'Success',
  },
  {
    id: 'm5',
    operation: 'Vault Breach',
    heroIds: ['4'],
    launched: '26 Jun 2026',
    status: 'Closed',
    outcome: 'Aborted',
  },
  {
    id: 'm6',
    operation: 'Dockside Watch',
    heroIds: ['6', '12'],
    launched: '16 Oct 2026',
    status: 'Live',
    outcome: null,
  },
  {
    id: 'm7',
    operation: 'Relay Flood',
    heroIds: ['7'],
    launched: '17 Oct 2026',
    status: 'Live',
    outcome: null,
  },
];
