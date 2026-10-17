import type { Threat } from './threat.model';

/**
 * EXAMPLE DATA. These threats are invented for the Hero Ops Console demo.
 * They are not real organisations, and the levels are not an assessment.
 */
export const EXAMPLE_THREATS: readonly Threat[] = [
  { id: 'sable-syndicate', name: 'Sable Syndicate', region: 'Harbor District', level: 'Severe', summary: 'Smuggling ring moving tech components through the port.' },
  { id: 'the-quiet-hour', name: 'The Quiet Hour', region: 'Old Quarter', level: 'High', summary: 'Psionic interference knocking out city sensor grids at night.' },
  { id: 'iron-meridian', name: 'Iron Meridian', region: 'Northern Rail', level: 'Critical', summary: 'Armoured convoy hijacking along the freight corridor.' },
  { id: 'ember-cult', name: 'Ember Cult', region: 'Dockside Warehouses', level: 'Moderate', summary: 'Unlicensed energy experiments with a history of minor fires.' },
  { id: 'hollow-signal', name: 'Hollow Signal', region: 'Uplands', level: 'Low', summary: 'Pirate broadcast interfering with emergency frequencies.' },
  { id: 'vantage-group', name: 'Vantage Group', region: 'Financial Ward', level: 'High', summary: 'Corporate front suspected of funding enhanced-human trials.' },
];
