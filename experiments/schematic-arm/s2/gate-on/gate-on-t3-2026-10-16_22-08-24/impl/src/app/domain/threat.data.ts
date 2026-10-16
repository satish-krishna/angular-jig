import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. These threats are invented for the Hero Ops Console demo and do
 * not describe real places, groups or events.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'TH-01', name: 'The Hollow Choir', region: 'Harbour District', level: 5, powerClass: 'Psionic', status: 'Active', summary: 'Broadcasts that overwrite the memories of anyone who hears them in full.' },
  { id: 'TH-02', name: 'Glasswing Syndicate', region: 'Midtown', level: 4, powerClass: 'Tech', status: 'Active', summary: 'Hijacks city grid controllers to stage blackouts ahead of armed robberies.' },
  { id: 'TH-03', name: 'The Quiet Orbit', region: 'Orbital Station 2', level: 5, powerClass: 'Cosmic', status: 'Monitoring', summary: 'Gravity wells that open without warning above the station solar arrays.' },
  { id: 'TH-04', name: 'Ferrous Tide', region: 'Eastgate', level: 3, powerClass: 'Mutant', status: 'Monitoring', summary: 'Metal-eating swarms that gather near the old rail yards after dark.' },
  { id: 'TH-05', name: 'Cinder Court', region: 'Old Quarter', level: 3, powerClass: 'Energy', status: 'Active', summary: 'Arsonists with plasma gauntlets who target archives and record offices.' },
  { id: 'TH-06', name: 'Fallowmere Cartel', region: 'Riverside', level: 2, powerClass: 'Enhanced', status: 'Contained', summary: 'Smuggling ring broken up in the spring operation; two members still at large.' },
];
