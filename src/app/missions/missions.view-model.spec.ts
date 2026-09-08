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

  it('resolves the mission being edited once startEdit runs', () => {
    const target = TestBed.inject(MissionService).missions()[0];
    expect(vm.editingMission()).toBeUndefined();
    vm.startEdit(target.id);
    expect(vm.editingMission()?.id).toBe(target.id);
  });

  it('updates rather than creates when a mission is being edited', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    const before = service.missions().length;
    vm.startEdit(target.id);
    vm.save({
      codename: 'Renamed',
      objective: target.objective,
      status: target.status,
      priority: target.priority,
      threatId: target.threatId,
      startedOn: target.startedOn,
      debrief: target.debrief,
    });
    expect(service.missions().length).toBe(before);
    expect(service.byId(target.id)?.codename).toBe('Renamed');
    expect(vm.editing()).toBeNull();
  });
});
