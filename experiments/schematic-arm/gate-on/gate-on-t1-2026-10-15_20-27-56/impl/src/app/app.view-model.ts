import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

export const DESTINATIONS = [
  { path: 'dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
  { path: 'roster', label: 'Roster', icon: 'lucideUsers' },
  { path: 'missions', label: 'Missions', icon: 'lucideTarget' },
  { path: 'threats', label: 'Threats', icon: 'lucideShieldAlert' },
  { path: 'recruit', label: 'Recruit', icon: 'lucideUserPlus' },
  { path: 'settings', label: 'Settings', icon: 'lucideSettings' },
] as const;

// Hero detail is reached from the roster, so it has a crumb but no rail entry.
const PAGE_TITLES: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  detail: 'Hero detail',
  missions: 'Missions',
  recruit: 'Recruit',
  threats: 'Threats',
  settings: 'Settings',
};

const THEME_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// Component-scoped: provided by App, so each app instance owns its own theme state.
@Injectable()
export class AppViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly window = this.document.defaultView;

  readonly destinations = DESTINATIONS;

  // A stored choice wins; with no choice the system preference decides.
  private hasChoice = this.storedTheme() !== null;
  readonly theme = signal<Theme>(this.storedTheme() ?? this.systemTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly currentPage = computed(() => PAGE_TITLES[this.url().split('/')[1] ?? ''] ?? 'Hero Ops Console');

  constructor() {
    this.applyTheme(this.theme());

    const media = this.window?.matchMedia?.(DARK_QUERY);
    const onSystemChange = (event: MediaQueryListEvent) => {
      if (!this.hasChoice) this.applyTheme(event.matches ? 'dark' : 'light');
    };
    media?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => media?.removeEventListener('change', onSystemChange));
  }

  /** The top-bar search goes to the roster, which filters on the `q` query parameter. */
  search(query: string): void {
    void this.router.navigate(['/roster'], { queryParams: { q: query.trim() || null } });
  }

  toggleTheme(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.hasChoice = true;
    this.storeTheme(next);
    this.applyTheme(next);
  }

  private applyTheme(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  private systemTheme(): Theme {
    return this.window?.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
  }

  private storedTheme(): Theme | null {
    try {
      const value = this.window?.localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // Storage can be blocked; fall back to the system preference.
      return null;
    }
  }

  private storeTheme(theme: Theme): void {
    try {
      this.window?.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Unpersisted for this session is acceptable when storage is blocked.
    }
  }
}
