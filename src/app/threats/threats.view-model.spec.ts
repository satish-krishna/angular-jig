import { TestBed } from '@angular/core/testing';
import { ThreatsViewModel } from './threats.view-model';
import { ThreatService } from '../threat/threat.service';

describe('ThreatsViewModel', () => {
  let vm: ThreatsViewModel;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThreatsViewModel] });
    vm = TestBed.inject(ThreatsViewModel);
  });

  it('lists every threat by default', () => {
    expect(vm.filtered().length).toBe(TestBed.inject(ThreatService).threats().length);
  });

  it('filters by designation', () => {
    const target = TestBed.inject(ThreatService).threats()[0];
    vm.searchQuery.set(target.designation.toLowerCase());
    expect(vm.filtered().map((t) => t.id)).toContain(target.id);
  });

  it('filters by level', () => {
    vm.levelFilter.set('Critical');
    expect(vm.filtered().every((t) => t.level === 'Critical')).toBe(true);
  });

  it('filters by status', () => {
    vm.statusFilter.set('Active');
    expect(vm.filtered().every((t) => t.status === 'Active')).toBe(true);
  });

  it('creates a threat through save when nothing is being edited', () => {
    const service = TestBed.inject(ThreatService);
    const before = service.threats().length;
    vm.startCreate();
    vm.save({
      designation: 'Pale Circuit',
      category: 'Rogue',
      level: 'Moderate',
      status: 'Active',
      location: 'Osaka',
      firstSeenOn: '2026-09-05',
      notes: '',
    });
    expect(service.threats().length).toBe(before + 1);
  });

  it('removes a threat', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    vm.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });

  it('counts the missions linked to a threat', () => {
    const linked = TestBed.inject(ThreatService).threats()[0];
    expect(typeof vm.missionCount(linked.id)).toBe('number');
  });
});
