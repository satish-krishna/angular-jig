import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. Fictional threats for the Hero Ops Console demo. Nothing here is a real
 * place, person or record, and there is no backend behind it.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'THR-101', name: 'Harbor Breach', tier: 'Tier 4', status: 'Contained', location: 'Harbor District, pier 9', summary: 'Armed boarding of a cargo vessel. Contained, with one responder on medical hold.' },
  { id: 'THR-102', name: 'Nightfall Syndicate', tier: 'Tier 3', status: 'Open', location: 'Old Quarter tunnels', summary: 'Organised smuggling of unstable power cores through the old transit tunnels.' },
  { id: 'THR-103', name: 'Glass Foundry Sabotage', tier: 'Tier 2', status: 'Closed', location: 'Northside foundry', summary: 'Sabotage of the foundry furnaces. Perpetrators in custody; the site is back online.' },
  { id: 'THR-104', name: 'Skyline Drone Swarm', tier: 'Tier 5', status: 'Open', location: 'Financial quarter, sky bridges', summary: 'Coordinated drone swarm disrupting the sky bridges. Cosmic-tier response required.' },
  { id: 'THR-105', name: 'Signal Storm', tier: 'Tier 4', status: 'Open', location: 'Regional broadcast towers', summary: 'Psionic interference across the regional broadcast network. Source not yet located.' },
];
