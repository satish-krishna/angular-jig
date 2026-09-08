import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Missions } from './missions';
import { MissionsViewModel } from './missions.view-model';
import { MissionService } from '../mission/mission.service';

describe('Missions screen wiring', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Missions],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets the mission being edited when the Edit control is activated', async () => {
    const fixture = TestBed.createComponent(Missions);
    await fixture.whenStable();

    // The component provides its own ViewModel, so read the instance the
    // template is actually bound to rather than a fresh one.
    const vm = fixture.debugElement.injector.get(MissionsViewModel);
    const firstMission = TestBed.inject(MissionService).missions()[0];

    expect(vm.editing()).toBeNull();

    const editControl = fixture.nativeElement.querySelector(
      '[data-testid="edit-mission"]',
    ) as HTMLElement | null;
    expect(editControl).toBeTruthy();

    editControl!.click();
    await fixture.whenStable();

    // Crosses the template-to-ViewModel seam: this fails if the click handler
    // is missing, which a direct vm.startEdit() call cannot detect.
    expect(vm.editing()).toBe(firstMission.id);
    expect(vm.editingMission()?.id).toBe(firstMission.id);
  });
});
