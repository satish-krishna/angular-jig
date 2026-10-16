import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, fromEvent, map, of } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

const THEME_STORAGE_KEY = 'hero-ops-theme';

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  detail: 'Hero detail',
  missions: 'Missions',
  recruit: 'Recruit',
  threats: 'Threats',
  settings: 'Settings',
};

/**
 * State for the application shell: the theme and the breadcrumb. Component-scoped
 * (provided by App), so the shell's state dies with the shell.
 */
@Injectable()
export class AppViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly storage = this.document.defaultView?.localStorage ?? null;
  private readonly systemQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)') ?? null;

  /** The user's explicit choice; null means "follow the system". */
  private readonly choice = signal<Theme | null>(this.readStoredTheme());
  private readonly systemPrefersDark = toSignal(
    this.systemQuery
      ? fromEvent<MediaQueryListEvent>(this.systemQuery, 'change').pipe(map((event) => event.matches))
      : of(false),
    { initialValue: this.systemQuery?.matches ?? false },
  );

  readonly dark = computed(() => (this.choice() ?? (this.systemPrefersDark() ? 'dark' : 'light')) === 'dark');

  readonly themeLabel = computed(() => (this.dark() ? 'Switch to light theme' : 'Switch to dark theme'));

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
    { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
    { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
    { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
    { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
    { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** The current section's name, for the breadcrumb's last crumb. */
  readonly section = computed(() => {
    const segment = this.url().split(/[/?#]/)[1] ?? '';
    return SECTION_LABELS[segment] ?? 'Dashboard';
  });

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  toggleTheme(): void {
    const next: Theme = this.dark() ? 'light' : 'dark';
    this.choice.set(next);
    this.storage?.setItem(THEME_STORAGE_KEY, next);
  }

  private readStoredTheme(): Theme | null {
    const stored = this.storage?.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }
}
