import { TestBed } from '@angular/core/testing';
import { Settings } from './settings';
import { PreferencesService } from '../preferences/preferences.service';

describe('Settings screen wiring', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [Settings] }).compileComponents();
  });

  it('writes a preference through to the service when the control is activated', async () => {
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();

    const preferences = TestBed.inject(PreferencesService);
    expect(preferences.compactTables()).toBe(false);

    const control = fixture.nativeElement.querySelector(
      '[data-testid="compact-tables"]',
    ) as HTMLElement | null;
    expect(control).toBeTruthy();

    control!.click();
    await fixture.whenStable();

    // Crosses the template-to-service seam: fails if the control renders but
    // its handler is not bound, which a ViewModel test cannot detect.
    expect(preferences.compactTables()).toBe(true);
  });
});
