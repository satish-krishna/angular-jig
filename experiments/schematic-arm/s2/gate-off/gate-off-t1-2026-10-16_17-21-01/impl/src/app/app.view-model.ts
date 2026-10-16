import { DOCUMENT } from '@angular/common';
import { Injectable, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly link?: string;
}

const THEME_KEY = 'hero-ops-theme';

const SECTION_LABELS: Partial<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  recruit: 'Recruit',
  threats: 'Threats',
  settings: 'Settings',
};

// Storage can be blocked (private mode, sandboxed frames); the theme then
// simply does not persist, which is better than a crashed shell.
function readStoredTheme(view: Window | null): Theme | null {
  try {
    const value = view?.localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(view: Window | null, theme: Theme): void {
  try {
    view?.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Not persisted; the in-memory choice still applies for this session.
  }
}

// Component-scoped (the shell provides it). Owns the theme and the breadcrumb
// so the App component stays a thin shell.
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly view = this.document.defaultView;
  // matchMedia is absent in jsdom and some embedded contexts; without it the
  // system preference is simply treated as light.
  private readonly systemQuery = this.view?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly navItems: readonly NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
    { path: '/roster', label: 'Roster', icon: 'lucideUsers' },
    { path: '/recruit', label: 'Recruit', icon: 'lucideUserPlus' },
    { path: '/threats', label: 'Threats', icon: 'lucideShieldAlert' },
    { path: '/settings', label: 'Settings', icon: 'lucideSettings' },
  ];

  // An explicit choice wins; with no choice the system preference decides.
  private readonly storedTheme = signal<Theme | null>(readStoredTheme(this.view));
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);
  readonly isDark = computed(
    () => (this.storedTheme() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<Crumb[]>(() => {
    const section = this.url().split(/[?#]/)[0].split('/').filter(Boolean)[0] ?? 'dashboard';
    if (section === 'detail') {
      return [{ label: 'Roster', link: '/roster' }, { label: 'Hero detail' }];
    }
    return [{ label: SECTION_LABELS[section] ?? 'Hero Ops' }];
  });

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });

    const query = this.systemQuery;
    if (query) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }
  }

  toggleTheme(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.storedTheme.set(next);
    writeStoredTheme(this.view, next);
  }

  // Search hands its term to the roster as ?q=. An empty term clears the filter.
  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }
}
