import { TestBed } from '@angular/core/testing';
import { ThreatService } from '../threat/threat.service';
import { MissionService } from './mission.service';

describe('MissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('deploying engages the threat and adds a live mission', () => {
    const missions = TestBed.inject(MissionService);
    const threats = TestBed.inject(ThreatService);
    const before = missions.live();
    const mission = missions.deploy('1', 'T-01');
    expect(missions.live()).toBe(before + 1);
    expect(threats.byId('T-01')?.status).toBe('Engaged');
    expect(missions.forHero('1').map((item) => item.id)).toContain(mission.id);
  });

  it('completing a mission contains its threat', () => {
    const missions = TestBed.inject(MissionService);
    const threats = TestBed.inject(ThreatService);
    missions.complete('M-104');
    expect(missions.records().find((item) => item.id === 'M-104')?.outcome).toBe('Success');
    expect(threats.byId('T-03')?.status).toBe('Contained');
  });

  it('containing a threat closes its live missions as successes', () => {
    const missions = TestBed.inject(MissionService);
    missions.contain('T-05');
    expect(missions.records().find((item) => item.id === 'M-105')?.outcome).toBe('Success');
    expect(TestBed.inject(ThreatService).byId('T-05')?.status).toBe('Contained');
  });

  it('resolves each mission to its threat name and tier', () => {
    const record = TestBed.inject(MissionService).records().find((item) => item.id === 'M-102');
    expect(record?.threatName).toBe('Harbor Breach');
    expect(record?.tier).toBe(4);
  });
});
