import type { Mission } from './mission.model';

/**
 * EXAMPLE DATA. The mission log is invented for the Hero Ops Console demo.
 * Nothing here reflects a real operation.
 */
export const EXAMPLE_MISSIONS: readonly Mission[] = [
  { id: 'MSN-0001', heroId: 'HRO-0007', title: 'Harbor storm rescue', result: 'Success' },
  { id: 'MSN-0002', heroId: 'HRO-0007', title: 'Skyline bridge recovery', result: 'Partial' },
  { id: 'MSN-0003', heroId: 'HRO-0012', title: 'Reactor containment', result: 'Success' },
  { id: 'MSN-0004', heroId: 'HRO-0012', title: 'Grid blackout response', result: 'Success' },
  { id: 'MSN-0005', heroId: 'HRO-0021', title: 'Dark-site extraction', result: 'Failed' },
  { id: 'MSN-0006', heroId: 'HRO-0021', title: 'Signal tracing', result: 'Success' },
  { id: 'MSN-0007', heroId: 'HRO-0033', title: 'Orbital debris sweep', result: 'Success' },
  { id: 'MSN-0008', heroId: 'HRO-0033', title: 'Meteor shower evacuation', result: 'Success' },
  { id: 'MSN-0009', heroId: 'HRO-0040', title: 'Rail yard lockdown', result: 'Partial' },
  { id: 'MSN-0010', heroId: 'HRO-0040', title: 'Foundry fire', result: 'Success' },
  { id: 'MSN-0011', heroId: 'HRO-0044', title: 'Prototype field test', result: 'In field' },
  { id: 'MSN-0012', heroId: 'HRO-0044', title: 'Vault lock repair', result: 'Success' },
  { id: 'MSN-0013', heroId: 'HRO-0051', title: 'Hostage negotiation', result: 'Success' },
  { id: 'MSN-0014', heroId: 'HRO-0051', title: 'Riot de-escalation', result: 'Partial' },
  { id: 'MSN-0015', heroId: 'HRO-0058', title: 'Dimensional breach sealing', result: 'Success' },
  { id: 'MSN-0016', heroId: 'HRO-0058', title: 'Border anomaly', result: 'Failed' },
  { id: 'MSN-0017', heroId: 'HRO-0063', title: 'Warehouse blaze', result: 'Success' },
  { id: 'MSN-0018', heroId: 'HRO-0063', title: 'Wildfire perimeter', result: 'Partial' },
  { id: 'MSN-0019', heroId: 'HRO-0070', title: 'Power-dampener raid', result: 'Failed' },
  { id: 'MSN-0020', heroId: 'HRO-0070', title: 'Containment breach', result: 'Success' },
  { id: 'MSN-0021', heroId: 'HRO-0075', title: 'Bridge demolition', result: 'Success' },
  { id: 'MSN-0022', heroId: 'HRO-0075', title: 'Quake aftershock', result: 'Success' },
  { id: 'MSN-0023', heroId: 'HRO-0081', title: 'Ferry evacuation', result: 'Success' },
  { id: 'MSN-0024', heroId: 'HRO-0081', title: 'Ransomware takedown', result: 'Partial' },
];
