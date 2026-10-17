import { DOCUMENT } from '@angular/common';
import { Injectable, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

type Theme = 'light' | 'dark';

// 'system' is the absence of a saved choice: the OS decides.
export type ThemeChoice = 'system' | Theme;

const THEME_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly path?: string;
}

// The shell's state: the theme, the breadcrumb, and the search hand-off.
// Component-scoped (provided by App), so it dies with the shell.
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly win = inject(DOCUMENT).defaultView;
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly systemQuery = this.win?.matchMedia?.(DARK_QUERY) ?? null;

  // An explicit choice wins; null means the user has not chosen, so the OS decides.
  private readonly saved = signal<Theme | null>(this.readSaved());
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);
  readonly choice = computed<ThemeChoice>(() => this.saved() ?? 'system');
  readonly dark = computed(() => (this.saved() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark');
  readonly themeLabel = computed(() => (this.dark() ? 'Switch to light theme' : 'Switch to dark theme'));
  readonly themeIcon = computed(() => (this.dark() ? 'lucideSun' : 'lucideMoon'));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const home: Crumb = { label: 'Hero Ops', path: '/dashboard' };
    const path = this.url().split(/[?#]/)[0] ?? '';
    const [section] = path.split('/').filter(Boolean);
    if (section === 'detail') {
      return [home, { label: 'Roster', path: '/roster' }, { label: 'Hero detail' }];
    }
    return [home, { label: SECTION_LABELS[section ?? ''] ?? 'Dashboard' }];
  });

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
    { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
    { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
    { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
    { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
    { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
  ];

  constructor() {
    effect(() => {
      this.root.classList.toggle('dark', this.dark());
    });

    const onSystemChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
    this.systemQuery?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => this.systemQuery?.removeEventListener('change', onSystemChange));
  }

  toggleTheme(): void {
    this.setTheme(this.dark() ? 'light' : 'dark');
  }

  setTheme(choice: ThemeChoice): void {
    this.saved.set(choice === 'system' ? null : choice);
    try {
      if (choice === 'system') {
        this.win?.localStorage.removeItem(THEME_KEY);
      } else {
        this.win?.localStorage.setItem(THEME_KEY, choice);
      }
    } catch {
      // Storage unavailable (private mode, blocked): the choice holds for this visit only.
    }
  }

  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: query ? { q: query } : {} });
  }

  private readSaved(): Theme | null {
    try {
      const value = this.win?.localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
