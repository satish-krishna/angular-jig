import { TestBed } from '@angular/core/testing';
import { MissionsViewModel } from './missions.view-model';
import { MissionService } from '../mission/mission.service';

describe('MissionsViewModel', () => {
  let vm: MissionsViewModel;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MissionsViewModel] });
    vm = TestBed.inject(MissionsViewModel);
  });

  it('lists every mission by default', () => {
    expect(vm.filtered().length).toBe(TestBed.inject(MissionService).missions().length);
  });

  it('filters by codename', () => {
    const target = TestBed.inject(MissionService).missions()[0];
    vm.searchQuery.set(target.codename.toLowerCase());
    expect(vm.filtered().map((m) => m.id)).toContain(target.id);
  });

  it('filters by status', () => {
    vm.statusFilter.set('Active');
    expect(vm.filtered().every((m) => m.status === 'Active')).toBe(true);
  });

  it('filters to priority missions only', () => {
    vm.priorityOnly.set(true);
    expect(vm.filtered().every((m) => m.priority)).toBe(true);
  });

  it('creates a mission through save when nothing is being edited', () => {
    const before = TestBed.inject(MissionService).missions().length;
    vm.startCreate();
    vm.save({
      codename: 'Deep Quiet',
      objective: 'Survey the shelf',
      status: 'Planned',
      priority: false,
      threatId: null,
      startedOn: '2026-09-07',
      debrief: '',
    });
    expect(TestBed.inject(MissionService).missions().length).toBe(before + 1);
  });

  it('removes a mission', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    vm.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });
});
