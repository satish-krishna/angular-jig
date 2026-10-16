import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. These missions are invented for the Hero Ops Console demo. They seed the
 * in-memory `MissionService`, and each one targets a threat in `example-threats.ts`.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-2041', title: 'Harbor containment', threatId: 'THR-104' },
  { id: 'MSN-2044', title: 'Signal jam', threatId: 'THR-107' },
  { id: 'MSN-2047', title: 'Choir extraction', threatId: 'THR-112' },
  { id: 'MSN-2050', title: 'Rail yard sweep', threatId: 'THR-101' },
  { id: 'MSN-2053', title: 'Ridge watch', threatId: 'THR-121' },
  { id: 'MSN-2056', title: 'Mirror audit', threatId: 'THR-118' },
];
