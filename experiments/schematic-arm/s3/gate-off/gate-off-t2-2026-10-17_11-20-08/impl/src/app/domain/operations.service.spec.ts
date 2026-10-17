import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardViewModel } from '../dashboard/dashboard.view-model';
import { recruitSchema } from '../recruit/recruit.schema';
import { HeroService } from './hero.service';
import { MissionService } from './mission.service';

describe('shared operations state', () => {
  beforeEach(() => {
    TestBed.inject(HeroService).reset();
    TestBed.inject(MissionService).reset();
  });

  it('shows a power change from the roster on the dashboard', () => {
    const heroes = TestBed.inject(HeroService);
    const dashboard = TestBed.runInInjectionContext(() => new DashboardViewModel());
    heroes.update('HRO-0007', { powerIndex: 99 });
    expect(dashboard.topHeroes()[0]?.id).toBe('HRO-0007');
    expect(dashboard.rosterPreview()[0]?.hero.powerIndex).toBe(99);
  });

  it('recruits an Active hero under the next free id', () => {
    const heroes = TestBed.inject(HeroService);
    const before = heroes.heroes().length;
    const hero = heroes.recruit({
      name: 'Comet',
      alias: 'Rin Okada',
      powerClass: 'Cosmic',
      powerIndex: 60,
      clearanceTier: 2,
      notes: '',
    });
    expect(hero.id).toBe('HRO-0082');
    expect(hero.status).toBe('Active');
    expect(heroes.findById('HRO-0082')?.name).toBe('Comet');
    expect(heroes.heroes()).toHaveLength(before + 1);
  });

  it('launches a live deployment and records its result', () => {
    const missions = TestBed.inject(MissionService);
    const before = missions.liveCount();
    const launched = missions.deploy('HRO-0007', 'THR-02');
    expect(launched.status).toBe('Live');
    expect(missions.liveCount()).toBe(before + 1);

    missions.resolve(launched.id, 'Succeeded');
    expect(missions.missions().find((mission) => mission.id === launched.id)?.status).toBe('Succeeded');
    expect(missions.liveCount()).toBe(before);
  });

  it('counts a launch on the dashboard', () => {
    const missions = TestBed.inject(MissionService);
    const dashboard = TestBed.runInInjectionContext(() => new DashboardViewModel());
    const live = dashboard.stats().find((stat) => stat.key === 'missions')?.value;
    missions.deploy('HRO-0007', 'THR-02');
    expect(dashboard.stats().find((stat) => stat.key === 'missions')?.value).toBe((live ?? 0) + 1);
  });
});

describe('recruit schema', () => {
  const draft = { name: 'Comet', alias: 'Rin Okada', powerClass: 'Cosmic', powerIndex: 60, clearanceTier: 2, notes: '' };

  it('accepts a complete draft', () => {
    expect(recruitSchema.safeParse(draft).success).toBe(true);
  });

  it('rejects a clearance tier off the 1 to 5 scale', () => {
    expect(recruitSchema.safeParse({ ...draft, clearanceTier: 6 }).success).toBe(false);
  });

  it('keeps the shared name rule from the hero schema', () => {
    expect(recruitSchema.safeParse({ ...draft, name: '   ' }).success).toBe(false);
  });
});
