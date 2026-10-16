import type { Hero } from './hero.model';

/**
 * EXAMPLE DATA. The roster is invented for the Hero Ops Console demo and is not
 * backed by any service. It is seeded into HeroService as in-memory state.
 */
export const EXAMPLE_ROSTER: readonly Hero[] = [
  { id: 'HRO-0007', name: 'Silverwing', alias: 'Ada Voss', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearanceTier: 4, missionCount: 64, successRate: 92 },
  { id: 'HRO-0012', name: 'Dr. Ion', alias: 'Marcus Reyes', powerClass: 'Energy', powerIndex: 94, status: 'Active', clearanceTier: 5, missionCount: 118, successRate: 88 },
  { id: 'HRO-0021', name: 'Vantablack', alias: 'Unknown', powerClass: 'Psionic', powerIndex: 81, status: 'Reserve', clearanceTier: 3, missionCount: 29, successRate: 79 },
  { id: 'HRO-0033', name: 'Aurora Vale', alias: 'Lena Park', powerClass: 'Cosmic', powerIndex: 97, status: 'Active', clearanceTier: 5, missionCount: 151, successRate: 90 },
  { id: 'HRO-0040', name: 'Magnetar', alias: 'Idris Kane', powerClass: 'Enhanced', powerIndex: 76, status: 'Injured', clearanceTier: 3, missionCount: 57, successRate: 84 },
  { id: 'HRO-0044', name: 'The Tinkerer', alias: 'Sam Okafor', powerClass: 'Tech', powerIndex: 69, status: 'Active', clearanceTier: 2, missionCount: 22, successRate: 95 },
  { id: 'HRO-0051', name: 'Halcyon', alias: 'Priya Nair', powerClass: 'Psionic', powerIndex: 85, status: 'Active', clearanceTier: 4, missionCount: 73, successRate: 87 },
  { id: 'HRO-0058', name: 'Rift', alias: 'Classified', powerClass: 'Cosmic', powerIndex: 91, status: 'Reserve', clearanceTier: 4, missionCount: 44, successRate: 82 },
  { id: 'HRO-0063', name: 'Ember Cho', alias: 'Jae Cho', powerClass: 'Energy', powerIndex: 78, status: 'Active', clearanceTier: 3, missionCount: 48, successRate: 86 },
  { id: 'HRO-0070', name: 'Null', alias: 'Unknown', powerClass: 'Mutant', powerIndex: 83, status: 'MIA', clearanceTier: 4, missionCount: 66, successRate: 80 },
  { id: 'HRO-0075', name: 'Grond', alias: 'Boris Volkov', powerClass: 'Enhanced', powerIndex: 72, status: 'Active', clearanceTier: 2, missionCount: 31, successRate: 90 },
  { id: 'HRO-0081', name: 'Ms. Meridian', alias: 'Grace Bello', powerClass: 'Tech', powerIndex: 80, status: 'Active', clearanceTier: 3, missionCount: 59, successRate: 89 },
];
