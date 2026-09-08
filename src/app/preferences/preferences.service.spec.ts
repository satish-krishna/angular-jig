import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('constructs in an environment with no matchMedia', () => {
    // jsdom does not implement matchMedia. Constructing must not throw:
    // this is the defect that broke both app tests.
    expect(() => TestBed.inject(PreferencesService)).not.toThrow();
  });

  it('defaults to following the system theme', () => {
    const service = TestBed.inject(PreferencesService);
    expect(service.theme()).toBe('system');
    expect(service.rosterSort()).toBe('power');
    expect(service.rosterStatus()).toBe('all');
    expect(service.compactTables()).toBe(false);
  });

  it('resolves isDark from an explicit choice', () => {
    const service = TestBed.inject(PreferencesService);
    service.setTheme('dark');
    expect(service.isDark()).toBe(true);
    service.setTheme('light');
    expect(service.isDark()).toBe(false);
  });

  it('persists a choice across instances', () => {
    TestBed.inject(PreferencesService).setTheme('dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PreferencesService).theme()).toBe('dark');
  });

  it('falls back to defaults when stored data is corrupt', () => {
    localStorage.setItem('hero-ops-console.preferences', 'not json');
    expect(TestBed.inject(PreferencesService).theme()).toBe('system');
  });

  it('records the other preferences', () => {
    const service = TestBed.inject(PreferencesService);
    service.setRosterSort('name');
    service.setRosterStatus('Injured');
    service.setCompactTables(true);
    expect(service.rosterSort()).toBe('name');
    expect(service.rosterStatus()).toBe('Injured');
    expect(service.compactTables()).toBe(true);
  });
});
