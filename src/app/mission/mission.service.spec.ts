import { TestBed } from '@angular/core/testing';
import { MissionService } from './mission.service';
import { HeroService } from '../hero/hero.service';
import { ThreatService } from '../threat/threat.service';

describe('MissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('seeds from example data', () => {
    expect(TestBed.inject(MissionService).missions().length).toBeGreaterThan(0);
  });

  it('creates a mission with a fresh id and returns it', () => {
    const service = TestBed.inject(MissionService);
    const before = service.missions().length;
    const created = service.create({
      codename: 'Nightfall',
      objective: 'Contain the rift',
      status: 'Planned',
      priority: true,
      threatId: null,
      startedOn: '2026-09-07',
      debrief: '',
    });
    expect(service.missions().length).toBe(before + 1);
    expect(service.byId(created.id)?.codename).toBe('Nightfall');
    expect(created.priority).toBe(true);
  });

  it('updates only the fields it is given', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    service.update(target.id, { status: 'Complete' });
    expect(service.byId(target.id)?.status).toBe('Complete');
    expect(service.byId(target.id)?.codename).toBe(target.codename);
  });

  it('removes a mission', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    service.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });

  it('detaches a hero id once that hero is retired', () => {
    const heroes = TestBed.inject(HeroService);
    const service = TestBed.inject(MissionService);
    const assigned = service.missions().find((m) => m.heroIds.length > 0);
    expect(assigned).toBeDefined();
    const heroId = assigned!.heroIds[0];
    heroes.retire(heroId);
    TestBed.flushEffects();
    expect(service.byId(assigned!.id)?.heroIds).not.toContain(heroId);
  });

  it('nulls a threat reference once that threat is deleted', () => {
    const threats = TestBed.inject(ThreatService);
    const service = TestBed.inject(MissionService);
    const linked = service.missions().find((m) => m.threatId !== null);
    expect(linked).toBeDefined();
    threats.remove(linked!.threatId!);
    TestBed.flushEffects();
    expect(service.byId(linked!.id)?.threatId).toBeNull();
  });

  it('lists the missions for one hero', () => {
    const service = TestBed.inject(MissionService);
    const assigned = service.missions().find((m) => m.heroIds.length > 0)!;
    expect(service.forHero(assigned.heroIds[0]).map((m) => m.id)).toContain(assigned.id);
  });
});
