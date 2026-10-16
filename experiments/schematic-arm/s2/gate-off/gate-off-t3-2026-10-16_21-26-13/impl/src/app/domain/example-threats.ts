import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. These threats are invented for the Hero Ops Console capstone and
 * are not real records. Threat levels, locations and clearances are illustrative only.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', codename: 'Harbor Breach', location: 'Port district, pier 9', level: 'Severe', status: 'Open', requiredClearance: 'Tier 4', summary: 'Armed crew forcing entry to a cargo vault. Civilian dock workers still on site.' },
  { id: 'THR-102', codename: 'Glasshouse Drift', location: 'Northern greenhouse complex', level: 'Elevated', status: 'Monitoring', requiredClearance: 'Tier 2', summary: 'Airborne contaminant tracked across three sensor grids. Source not yet located.' },
  { id: 'THR-103', codename: 'Nightfall Relay', location: 'Old transit tunnels', level: 'Critical', status: 'Open', requiredClearance: 'Tier 5', summary: 'Unregistered power-nullifier relay active underground. Last seen during Operation Nightfall.' },
  { id: 'THR-104', codename: 'Tollway Gridlock', location: 'Eastern ring road', level: 'Low', status: 'Contained', requiredClearance: 'Tier 1', summary: 'Stalled vehicles caused by a jammer. Traffic cleared and the device is recovered.' },
  { id: 'THR-105', codename: 'Stormline Rig', location: 'Offshore platform 4', level: 'Elevated', status: 'Open', requiredClearance: 'Tier 3', summary: 'Weather-control rig drifting toward the shipping lane. Crew evacuated.' },
  { id: 'THR-106', codename: 'Ashfall Cell', location: 'Industrial east, block C', level: 'Severe', status: 'Contained', requiredClearance: 'Tier 3', summary: 'Thermal-weapons cell neutralised. Two suspects in custody, one still outstanding.' },
];
