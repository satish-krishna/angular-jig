import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Hero, HeroClearance, HeroPowerClass, HeroStatus } from './hero.model';
import { heroSchema, type HeroModel } from './hero.schema';

/** The fields whose value is picked from a list, so the form emits them untyped. */
export type ChoiceField = 'powerClass' | 'status' | 'clearance';

export const STATUS_VARIANT: Readonly<Record<HeroStatus, BadgeVariants['variant']>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

export const BLANK_HERO: HeroModel = {
  name: '',
  alias: '',
  powerClass: 'Aerial',
  power: 0,
  status: 'Active',
  clearance: 'Tier 1',
  notes: '',
};

export interface RosterRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly initials: string;
  readonly powerClass: HeroPowerClass;
  readonly power: number;
  readonly status: HeroStatus;
  readonly statusVariant: BadgeVariants['variant'];
  readonly clearance: HeroClearance;
}

export function heroCode(id: string): string {
  return `HX-${id.padStart(3, '0')}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function toHeroModel(hero: Hero): HeroModel {
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    power: hero.power,
    status: hero.status,
    clearance: hero.clearance,
    notes: hero.notes,
  };
}

/** Wins and losses are derived from the logged count and the success rate. */
export function missionRecord(hero: Hero): { readonly wins: number; readonly losses: number } {
  const wins = Math.round((hero.missions * hero.successRate) / 100);
  return { wins, losses: hero.missions - wins };
}

/** A copy sorted strongest first. The input is never reordered. */
export function byPower(heroes: readonly Hero[]): Hero[] {
  return [...heroes].sort((a, b) => b.power - a.power);
}

export function rosterRows(heroes: readonly Hero[]): RosterRow[] {
  return byPower(heroes).map((hero) => ({
    id: hero.id,
    code: heroCode(hero.id),
    name: hero.name,
    initials: initialsOf(hero.name),
    powerClass: hero.powerClass,
    power: hero.power,
    status: hero.status,
    statusVariant: STATUS_VARIANT[hero.status],
    clearance: hero.clearance,
  }));
}

/** Applies a picked value only if the schema allows it for that field; anything else is ignored. */
export function withChoice(model: HeroModel, field: ChoiceField, value: unknown): HeroModel {
  const parsed = heroSchema.shape[field].safeParse(value);
  return parsed.success ? { ...model, [field]: parsed.data } : model;
}
