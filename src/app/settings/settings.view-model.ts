import { Injectable, computed, inject } from '@angular/core';
import { PreferencesService, type RosterSort, type ThemeChoice } from '../preferences/preferences.service';
import type { HeroStatus } from '../hero/hero.model';

@Injectable()
export class SettingsViewModel {
  private readonly preferences = inject(PreferencesService);

  readonly theme = computed(() => this.preferences.theme());
  readonly rosterSort = computed(() => this.preferences.rosterSort());
  readonly rosterStatus = computed(() => this.preferences.rosterStatus());
  readonly compactTables = computed(() => this.preferences.compactTables());

  readonly themeOptions: ReadonlyArray<{ value: ThemeChoice; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Follow system' },
  ];

  readonly sortOptions: ReadonlyArray<{ value: RosterSort; label: string }> = [
    { value: 'power', label: 'Power index' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ];

  setTheme(theme: ThemeChoice): void {
    this.preferences.setTheme(theme);
  }

  setRosterSort(sort: RosterSort): void {
    this.preferences.setRosterSort(sort);
  }

  setRosterStatus(status: HeroStatus | 'all'): void {
    this.preferences.setRosterStatus(status);
  }

  setCompactTables(compact: boolean): void {
    this.preferences.setCompactTables(compact);
  }
}
