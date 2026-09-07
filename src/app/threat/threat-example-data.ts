import type { Threat } from './threat.model';

/** Example data. Not a real threat register. */
export const EXAMPLE_THREATS: Threat[] = [
  { id: '1', designation: 'Leviathan Bloom', category: 'Kaiju', level: 'Critical', status: 'Active', location: 'Sea of Japan', firstSeenOn: '2026-03-14', notes: 'Biomass doubling every nine days.' },
  { id: '2', designation: 'The Gilded Hand', category: 'Syndicate', level: 'Severe', status: 'Active', location: 'Zurich', firstSeenOn: '2025-11-02', notes: 'Financing unlicensed augmentation.' },
  { id: '3', designation: 'Null Cascade', category: 'Anomaly', level: 'Severe', status: 'Contained', location: 'Atacama', firstSeenOn: '2026-01-27', notes: 'Localized causality inversion, contained by lattice.' },
  { id: '4', designation: 'Warden Prime', category: 'Rogue', level: 'Moderate', status: 'Active', location: 'Lagos', firstSeenOn: '2026-05-30', notes: 'Former asset, clearance revoked.' },
  { id: '5', designation: 'Hollow Star', category: 'Cosmic', level: 'Critical', status: 'Active', location: 'Lunar far side', firstSeenOn: '2026-07-11', notes: 'Signal source, intent unknown.' },
  { id: '6', designation: 'Ashfall Choir', category: 'Anomaly', level: 'Low', status: 'Neutralized', location: 'Reykjavik', firstSeenOn: '2025-09-08', notes: 'Resolved without deployment.' },
];
