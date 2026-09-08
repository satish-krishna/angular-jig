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

  // NOT COVERED HERE: that the three hlm-select controls actually open and write
  // through. Their behaviour depends on a CDK overlay, and jsdom provides neither
  // ResizeObserver nor scrollIntoView, so removing *hlmSelectPortal from every
  // select leaves this suite green. Verified manually in Chromium instead: the
  // option list is hidden until the trigger is clicked, choosing an option
  // applies and persists the value, and the label resolves to a real <button>.
  // The right home for an automated version is the browser-based boot check,
  // which currently renders each route without interacting with it.
});
