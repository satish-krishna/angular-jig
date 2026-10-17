import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HeroService } from './hero.service';
import { heroEditPatch, toHeroModel } from '../hero-detail/hero-detail.schema';
import { EXAMPLE_HEROES } from './hero.seed';

describe('HeroService', () => {
  it('starts from the example roster', () => {
    const service = TestBed.inject(HeroService);
    expect(service.heroes()).toHaveLength(EXAMPLE_HEROES.length);
  });

  it('looks a hero up by id', () => {
    const service = TestBed.inject(HeroService);
    expect(service.findById('HRO-0012')?.name).toBe('Dr. Ion');
    expect(service.findById('HRO-9999')).toBeUndefined();
  });

  it('updates one hero and keeps its id', () => {
    const service = TestBed.inject(HeroService);
    const updated = service.update('HRO-0007', { alias: 'Ada Vos', powerIndex: 90 });
    expect(updated?.alias).toBe('Ada Vos');
    expect(service.findById('HRO-0007')?.powerIndex).toBe(90);
    expect(service.findById('HRO-0007')?.id).toBe('HRO-0007');
  });

  it('returns undefined when updating an unknown id', () => {
    const service = TestBed.inject(HeroService);
    expect(service.update('HRO-9999', { alias: 'x' })).toBeUndefined();
  });
});

describe('hero edit mapping', () => {
  const injured = EXAMPLE_HEROES.find((h) => h.id === 'HRO-0040')!;

  it('projects active from status', () => {
    expect(toHeroModel(injured).active).toBe(false);
    expect(toHeroModel(EXAMPLE_HEROES[0]).active).toBe(true);
  });

  it('leaves status alone when the switch did not move', () => {
    const patch = heroEditPatch(injured, toHeroModel(injured));
    expect(patch.status).toBe('Injured');
  });

  it('moves an active hero to Reserve when the switch is turned off', () => {
    const active = EXAMPLE_HEROES[0];
    const patch = heroEditPatch(active, { ...toHeroModel(active), active: false });
    expect(patch.status).toBe('Reserve');
  });

  it('moves a reserve hero to Active when the switch is turned on', () => {
    const reserve = EXAMPLE_HEROES.find((h) => h.id === 'HRO-0021')!;
    const patch = heroEditPatch(reserve, { ...toHeroModel(reserve), active: true });
    expect(patch.status).toBe('Active');
  });
});
