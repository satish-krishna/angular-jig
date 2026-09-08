import { TestBed } from '@angular/core/testing';
import { ThreatService } from './threat.service';

describe('ThreatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('seeds from example data', () => {
    expect(TestBed.inject(ThreatService).threats().length).toBeGreaterThan(0);
  });

  it('creates a threat with a fresh id', () => {
    const service = TestBed.inject(ThreatService);
    const created = service.create({
      designation: 'Silent Tide',
      category: 'Anomaly',
      level: 'Severe',
      status: 'Active',
      location: 'Baltic Shelf',
      firstSeenOn: '2026-09-01',
      notes: '',
    });
    expect(service.byId(created.id)?.designation).toBe('Silent Tide');
  });

  it('updates only the fields it is given', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    service.update(target.id, { status: 'Contained' });
    expect(service.byId(target.id)?.status).toBe('Contained');
    expect(service.byId(target.id)?.designation).toBe(target.designation);
  });

  it('removes a threat', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    service.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });
});
