import type { Hero } from './hero.model';

/**
 * EXAMPLE DATA. These twelve heroes are invented for the Hero Ops Console demo
 * and do not describe real people or records. Every figure is illustrative.
 */
export const EXAMPLE_HEROES: readonly Hero[] = [
  { id: 'HO-001', name: 'Silverwing', alias: 'Tessa Harrow', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearanceTier: 4, missionCount: 214, successRate: 0.91 },
  { id: 'HO-002', name: 'Dr. Ion', alias: 'Elias Brandt', powerClass: 'Energy', powerIndex: 92, status: 'Active', clearanceTier: 5, missionCount: 301, successRate: 0.94 },
  { id: 'HO-003', name: 'Vantablack', alias: 'Jun Okafor', powerClass: 'Mutant', powerIndex: 71, status: 'Injured', clearanceTier: 3, missionCount: 96, successRate: 0.78 },
  { id: 'HO-004', name: 'Aurora Vale', alias: 'Lena Vasquez', powerClass: 'Energy', powerIndex: 84, status: 'Active', clearanceTier: 4, missionCount: 188, successRate: 0.89 },
  { id: 'HO-005', name: 'Magnetar', alias: 'Rhys Kettering', powerClass: 'Cosmic', powerIndex: 97, status: 'Active', clearanceTier: 5, missionCount: 262, successRate: 0.93 },
  { id: 'HO-006', name: 'The Tinkerer', alias: 'Gus Feld', powerClass: 'Tech', powerIndex: 66, status: 'Reserve', clearanceTier: 2, missionCount: 74, successRate: 0.82 },
  { id: 'HO-007', name: 'Halcyon', alias: 'Nia Sorensen', powerClass: 'Psionic', powerIndex: 79, status: 'Active', clearanceTier: 3, missionCount: 131, successRate: 0.86 },
  { id: 'HO-008', name: 'Rift', alias: 'Kai Mendes', powerClass: 'Cosmic', powerIndex: 81, status: 'MIA', clearanceTier: 4, missionCount: 140, successRate: 0.67 },
  { id: 'HO-009', name: 'Ember Cho', alias: 'Sun-hee Cho', powerClass: 'Enhanced', powerIndex: 58, status: 'Reserve', clearanceTier: 2, missionCount: 39, successRate: 0.85 },
  { id: 'HO-010', name: 'Null', alias: 'Adrian Marsh', powerClass: 'Psionic', powerIndex: 90, status: 'Active', clearanceTier: 5, missionCount: 205, successRate: 0.95 },
  { id: 'HO-011', name: 'Grond', alias: 'Dmitri Rusk', powerClass: 'Enhanced', powerIndex: 74, status: 'Active', clearanceTier: 3, missionCount: 118, successRate: 0.8 },
  { id: 'HO-012', name: 'Ms. Meridian', alias: 'Priya Anand', powerClass: 'Tech', powerIndex: 86, status: 'Active', clearanceTier: 4, missionCount: 176, successRate: 0.92 },
];
