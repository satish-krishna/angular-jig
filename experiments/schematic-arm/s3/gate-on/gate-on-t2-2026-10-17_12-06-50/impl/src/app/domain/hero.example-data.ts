import type { Hero } from './hero.model';

/**
 * EXAMPLE DATA. These heroes are invented for the Hero Ops Console demo.
 * They are not real people, and the figures are not measured results.
 */
export const EXAMPLE_HEROES: readonly Hero[] = [
  { id: 'silverwing', name: 'Silverwing', alias: 'The Glider', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearance: 'Tier 4', missionCount: 142, successRate: 94 },
  { id: 'dr-ion', name: 'Dr. Ion', alias: 'Ion Prime', powerClass: 'Energy', powerIndex: 91, status: 'Active', clearance: 'Tier 5', missionCount: 210, successRate: 96 },
  { id: 'vantablack', name: 'Vantablack', alias: 'Null Shade', powerClass: 'Psionic', powerIndex: 76, status: 'Injured', clearance: 'Tier 3', missionCount: 98, successRate: 89 },
  { id: 'aurora-vale', name: 'Aurora Vale', alias: 'Dawnlight', powerClass: 'Energy', powerIndex: 84, status: 'Active', clearance: 'Tier 4', missionCount: 133, successRate: 92 },
  { id: 'magnetar', name: 'Magnetar', alias: 'Polar', powerClass: 'Cosmic', powerIndex: 95, status: 'Active', clearance: 'Tier 5', missionCount: 187, successRate: 97 },
  { id: 'the-tinkerer', name: 'The Tinkerer', alias: 'Gearwright', powerClass: 'Tech', powerIndex: 67, status: 'Reserve', clearance: 'Tier 2', missionCount: 54, successRate: 85 },
  { id: 'halcyon', name: 'Halcyon', alias: 'Still Water', powerClass: 'Psionic', powerIndex: 72, status: 'Active', clearance: 'Tier 3', missionCount: 88, successRate: 90 },
  { id: 'rift', name: 'Rift', alias: 'Seam', powerClass: 'Cosmic', powerIndex: 79, status: 'MIA', clearance: 'Tier 4', missionCount: 61, successRate: 71 },
  { id: 'ember-cho', name: 'Ember Cho', alias: 'Cinder', powerClass: 'Energy', powerIndex: 81, status: 'Active', clearance: 'Tier 3', missionCount: 102, successRate: 88 },
  { id: 'null', name: 'Null', alias: 'Blank', powerClass: 'Psionic', powerIndex: 58, status: 'Reserve', clearance: 'Tier 2', missionCount: 31, successRate: 80 },
  { id: 'grond', name: 'Grond', alias: 'Stonefall', powerClass: 'Mutant', powerIndex: 86, status: 'Injured', clearance: 'Tier 4', missionCount: 119, successRate: 87 },
  { id: 'ms-meridian', name: 'Ms. Meridian', alias: 'Noon', powerClass: 'Enhanced', powerIndex: 74, status: 'Active', clearance: 'Tier 3', missionCount: 96, successRate: 93 },
];
