import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { EXAMPLE_HEROES } from './hero-example-data';

describe('HeroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('seeds from example data', () => {
    expect(TestBed.inject(HeroService).heroes().length).toBe(EXAMPLE_HEROES.length);
  });

  it('creates a record with a fresh id and returns it', () => {
    const service = TestBed.inject(HeroService);
    const before = service.heroes().length;
    const created = service.create({
      name: 'Test name',
      alias: 'Test alias',
      powerClass: 'Aerial',
      power: 0,
      status: 'Active',
      clearance: 'Tier 1',
      notes: '',
    });
    expect(service.heroes().length).toBe(before + 1);
    expect(service.byId(created.id)?.name).toEqual(created.name);
    expect(created.joined).toEqual('2026-10-17');
    expect(created.missions).toEqual(0);
    expect(created.successRate).toEqual(0);
  });

  it('updates only the fields it is given', () => {
    const service = TestBed.inject(HeroService);
    const created = service.create({
      name: 'Test name',
      alias: 'Test alias',
      powerClass: 'Aerial',
      power: 0,
      status: 'Active',
      clearance: 'Tier 1',
      notes: '',
    });
    service.update(created.id, { name: 'Changed' });
    expect(service.byId(created.id)?.name).toEqual('Changed');
    expect(service.byId(created.id)?.alias).toEqual(created.alias);
  });

  it('removes a record', () => {
    const service = TestBed.inject(HeroService);
    const created = service.create({
      name: 'Test name',
      alias: 'Test alias',
      powerClass: 'Aerial',
      power: 0,
      status: 'Active',
      clearance: 'Tier 1',
      notes: '',
    });
    service.remove(created.id);
    expect(service.byId(created.id)).toBeUndefined();
  });
});
