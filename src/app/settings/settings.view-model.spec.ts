import { TestBed } from '@angular/core/testing';
import { SettingsViewModel } from './settings.view-model';
import { PreferencesService } from '../preferences/preferences.service';

describe('SettingsViewModel', () => {
  let vm: SettingsViewModel;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [SettingsViewModel] });
    vm = TestBed.inject(SettingsViewModel);
  });

  it('reads the current preferences', () => {
    expect(vm.theme()).toBe('system');
    expect(vm.compactTables()).toBe(false);
  });

  it('writes the theme through to the service', () => {
    vm.setTheme('dark');
    expect(TestBed.inject(PreferencesService).theme()).toBe('dark');
    expect(vm.theme()).toBe('dark');
  });

  it('writes the roster sort through to the service', () => {
    vm.setRosterSort('name');
    expect(TestBed.inject(PreferencesService).rosterSort()).toBe('name');
  });

  it('writes compact tables through to the service', () => {
    vm.setCompactTables(true);
    expect(TestBed.inject(PreferencesService).compactTables()).toBe(true);
  });
});
