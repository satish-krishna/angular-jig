import type { Hero } from './hero.model';

/**
 * EXAMPLE DATA. These heroes are invented for the Hero Ops Console demo and
 * stand in for a real backend. Nothing here reflects real people or records.
 */
export const EXAMPLE_HEROES: readonly Hero[] = [
  { id: 'HRO-0007', name: 'Silverwing', alias: 'Ada Voss', powerClass: 'Aerial', powerIndex: 88, status: 'Active', clearanceTier: 4, missionCount: 64, successRate: 92, notes: 'Cleared for coastal rescue. Prefers high-altitude approaches.' },
  { id: 'HRO-0012', name: 'Dr. Ion', alias: 'Marcus Reyes', powerClass: 'Energy', powerIndex: 94, status: 'Active', clearanceTier: 5, missionCount: 118, successRate: 88, notes: 'Reactor specialist. Keep off the night shift until the grid audit closes.' },
  { id: 'HRO-0021', name: 'Vantablack', alias: 'Unknown', powerClass: 'Psionic', powerIndex: 81, status: 'Reserve', clearanceTier: 3, missionCount: 29, successRate: 79, notes: 'Reserve roster. Sensitive dark-site work only.' },
  { id: 'HRO-0033', name: 'Aurora Vale', alias: 'Lena Park', powerClass: 'Cosmic', powerIndex: 97, status: 'Active', clearanceTier: 5, missionCount: 151, successRate: 90, notes: 'Orbital debris lead. Strongest cosmic reading on file.' },
  { id: 'HRO-0040', name: 'Magnetar', alias: 'Idris Kane', powerClass: 'Enhanced', powerIndex: 76, status: 'Injured', clearanceTier: 3, missionCount: 57, successRate: 84, notes: 'Recovering from a rail-yard injury. Physio review due.' },
  { id: 'HRO-0044', name: 'The Tinkerer', alias: 'Sam Okafor', powerClass: 'Tech', powerIndex: 69, status: 'Active', clearanceTier: 2, missionCount: 22, successRate: 95, notes: 'Field prototyping. Gadget loadout changes weekly.' },
  { id: 'HRO-0051', name: 'Halcyon', alias: 'Priya Nair', powerClass: 'Psionic', powerIndex: 85, status: 'Active', clearanceTier: 4, missionCount: 73, successRate: 87, notes: 'Negotiation lead. Strong record on civilian incidents.' },
  { id: 'HRO-0058', name: 'Rift', alias: 'Classified', powerClass: 'Cosmic', powerIndex: 91, status: 'Reserve', clearanceTier: 4, missionCount: 44, successRate: 82, notes: 'Anomaly tracking. Stay clear of the border sector.' },
  { id: 'HRO-0063', name: 'Ember Cho', alias: 'Jae Cho', powerClass: 'Energy', powerIndex: 78, status: 'Active', clearanceTier: 3, missionCount: 48, successRate: 86, notes: 'Fire response. Reliable in confined spaces.' },
  { id: 'HRO-0070', name: 'Null', alias: 'Unknown', powerClass: 'Mutant', powerIndex: 83, status: 'MIA', clearanceTier: 4, missionCount: 66, successRate: 80, notes: 'Contact lost during the last raid. Welfare check pending.' },
  { id: 'HRO-0075', name: 'Grond', alias: 'Boris Volkov', powerClass: 'Enhanced', powerIndex: 72, status: 'Active', clearanceTier: 2, missionCount: 31, successRate: 90, notes: 'Demolition and structural work. Hearing protection required.' },
  { id: 'HRO-0081', name: 'Ms. Meridian', alias: 'Grace Bello', powerClass: 'Tech', powerIndex: 80, status: 'Active', clearanceTier: 3, missionCount: 59, successRate: 89, notes: 'Logistics and evacuation. Runs the ferry desk.' },
];
