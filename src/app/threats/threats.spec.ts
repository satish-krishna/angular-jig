import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Threats } from './threats';
import { ThreatsViewModel } from './threats.view-model';
import { ThreatService } from '../threat/threat.service';

describe('Threats screen wiring', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Threats],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets the threat being edited when the Edit control is activated', async () => {
    const fixture = TestBed.createComponent(Threats);
    await fixture.whenStable();

    // Read the ViewModel out of the COMPONENT's injector, never via
    // TestBed.inject: the component provides its own, and a TestBed-level
    // instance would be a different object from the one the template binds to,
    // making the assertion prove nothing.
    const vm = fixture.debugElement.injector.get(ThreatsViewModel);
    const firstThreat = TestBed.inject(ThreatService).threats()[0];

    expect(vm.editing()).toBeNull();

    const editControl = fixture.nativeElement.querySelector(
      '[data-testid="edit-threat"]',
    ) as HTMLElement | null;
    expect(editControl).toBeTruthy();

    editControl!.click();
    await fixture.whenStable();

    expect(vm.editing()).toBe(firstThreat.id);
    expect(vm.editingThreat()?.id).toBe(firstThreat.id);
  });

  it('clears a stale editing target when the create control is activated', async () => {
    const fixture = TestBed.createComponent(Threats);
    await fixture.whenStable();

    const vm = fixture.debugElement.injector.get(ThreatsViewModel);
    const firstThreat = TestBed.inject(ThreatService).threats()[0];

    // Simulate an Edit dialog that was opened and then dismissed without Cancel.
    vm.startEdit(firstThreat.id);
    expect(vm.editing()).toBe(firstThreat.id);
    await fixture.whenStable();

    const createControl = fixture.nativeElement.querySelector(
      '[data-testid="create-threat"]',
    ) as HTMLElement | null;
    expect(createControl).toBeTruthy();

    createControl!.click();
    await fixture.whenStable();

    // Without this reset, the next save would update the stale threat instead
    // of creating a new one.
    expect(vm.editing()).toBe('');
    expect(vm.editingThreat()).toBeUndefined();
  });
});
