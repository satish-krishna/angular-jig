import type { Hero } from './hero.model';

// EXAMPLE DATA. The Hero Ops Console is a kitchen-sink demo with no backend.
// These heroes are invented for illustration and do not describe real people.
export const EXAMPLE_HEROES: readonly Hero[] = [
  { id: 'HRO-0007', name: 'Silverwing', alias: 'Ada Voss', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearanceTier: 4, missions: 64, successRate: 92, notes: 'Aerial response lead. Prefers rooftop extractions.' },
  { id: 'HRO-0012', name: 'Dr. Ion', alias: 'Marcus Reyes', powerClass: 'Energy', powerIndex: 94, status: 'Active', clearanceTier: 5, missions: 118, successRate: 88, notes: 'Grid stabilisation specialist. Keep surge work off the civilian feeds.' },
  { id: 'HRO-0021', name: 'Vantablack', alias: 'Unknown', powerClass: 'Psionic', powerIndex: 81, status: 'Reserve', clearanceTier: 3, missions: 29, successRate: 79, notes: 'On psionic standby. Cleared for silent insertions only.' },
  { id: 'HRO-0033', name: 'Aurora Vale', alias: 'Lena Park', powerClass: 'Cosmic', powerIndex: 97, status: 'Active', clearanceTier: 5, missions: 151, successRate: 90, notes: 'Orbital asset. Every deployment needs a Tier 5 sign-off.' },
  { id: 'HRO-0040', name: 'Magnetar', alias: 'Idris Kane', powerClass: 'Enhanced', powerIndex: 76, status: 'Injured', clearanceTier: 3, missions: 57, successRate: 84, notes: 'Recovering from a fractured wrist. Medical review due next week.' },
  { id: 'HRO-0044', name: 'The Tinkerer', alias: 'Sam Okafor', powerClass: 'Tech', powerIndex: 69, status: 'Active', clearanceTier: 2, missions: 22, successRate: 95, notes: 'Builds field kit for the rest of the roster.' },
  { id: 'HRO-0051', name: 'Halcyon', alias: 'Priya Nair', powerClass: 'Psionic', powerIndex: 85, status: 'Active', clearanceTier: 4, missions: 73, successRate: 87, notes: 'Calms civilian crowds during evacuations.' },
  { id: 'HRO-0058', name: 'Rift', alias: 'Classified', powerClass: 'Cosmic', powerIndex: 91, status: 'Reserve', clearanceTier: 4, missions: 44, successRate: 82, notes: 'Reserve until the dimensional sensor is recalibrated.' },
  { id: 'HRO-0063', name: 'Ember Cho', alias: 'Jae Cho', powerClass: 'Energy', powerIndex: 78, status: 'Active', clearanceTier: 3, missions: 48, successRate: 86, notes: 'Fire-zone specialist. Rotate out after two long shifts.' },
  { id: 'HRO-0070', name: 'Null', alias: 'Unknown', powerClass: 'Mutant', powerIndex: 83, status: 'MIA', clearanceTier: 4, missions: 66, successRate: 80, notes: 'Missing since the Foundry incident. Search teams stood down.' },
  { id: 'HRO-0075', name: 'Grond', alias: 'Boris Volkov', powerClass: 'Enhanced', powerIndex: 72, status: 'Active', clearanceTier: 2, missions: 31, successRate: 90, notes: 'Heavy lifting and perimeter work.' },
  { id: 'HRO-0081', name: 'Ms. Meridian', alias: 'Grace Bello', powerClass: 'Tech', powerIndex: 80, status: 'Active', clearanceTier: 3, missions: 59, successRate: 89, notes: 'Runs the logistics feed and the drone relay.' },
];
