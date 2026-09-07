import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { HeroStatus } from '../hero/hero.model';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type RosterSort = 'power' | 'name' | 'status';

export interface Preferences {
  theme: ThemeChoice;
  rosterSort: RosterSort;
  rosterStatus: HeroStatus | 'all';
  compactTables: boolean;
}

const STORAGE_KEY = 'hero-ops-console.preferences';

const DEFAULTS: Preferences = {
  theme: 'system',
  rosterSort: 'power',
  rosterStatus: 'all',
  compactTables: false,
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  // The browser is reached through the document, never as a bare global. It is
  // null under SSR and, under jsdom, is a window with no matchMedia at all.
  private readonly view = this.document.defaultView;

  private readonly stored = signal<Preferences>(this.read());
  private readonly systemPrefersDark = signal(this.matchDark()?.matches ?? false);

  readonly theme = computed(() => this.stored().theme);
  readonly rosterSort = computed(() => this.stored().rosterSort);
  readonly rosterStatus = computed(() => this.stored().rosterStatus);
  readonly compactTables = computed(() => this.stored().compactTables);

  // Three states, not a boolean: only a distinct 'system' can express "the user
  // has made no choice", which is what the spec asks us to respect.
  readonly isDark = computed(() => {
    const choice = this.theme();
    return choice === 'dark' || (choice === 'system' && this.systemPrefersDark());
  });

  constructor() {
    const query = this.matchDark();
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
  }

  setTheme(theme: ThemeChoice): void {
    this.patch({ theme });
  }

  setRosterSort(rosterSort: RosterSort): void {
    this.patch({ rosterSort });
  }

  setRosterStatus(rosterStatus: HeroStatus | 'all'): void {
    this.patch({ rosterStatus });
  }

  setCompactTables(compactTables: boolean): void {
    this.patch({ compactTables });
  }

  private patch(part: Partial<Preferences>): void {
    const next = { ...this.stored(), ...part };
    this.stored.set(next);
    this.write(next);
  }

  private matchDark(): MediaQueryList | null {
    const view = this.view;
    if (!view || typeof view.matchMedia !== 'function') return null;
    try {
      return view.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return null;
    }
  }

  // Reading storage can throw outright when site data is blocked, so the guard
  // is around the access itself, not only around the parse.
  private read(): Preferences {
    try {
      const raw = this.view?.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private write(value: Preferences): void {
    try {
      this.view?.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage unavailable. Preferences still work for this session.
    }
  }
}
