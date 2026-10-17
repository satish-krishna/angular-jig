import { DestroyRef, DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly link?: string;
}

const THEME_KEY = 'hero-ops-theme';

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

// Component-scoped (no providedIn): the App component provides it.
@Injectable()
export class AppViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly systemDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly navItems = NAV_ITEMS;

  readonly theme = signal<Theme>(this.readStoredTheme() ?? (this.systemDark?.matches ? 'dark' : 'light'));

  readonly themeToggleLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed(() => this.crumbsFor(this.url()));

  constructor() {
    this.applyTheme(this.theme());

    // With no saved choice, follow the operating system as it changes.
    const media = this.systemDark;
    if (media) {
      const onChange = (event: MediaQueryListEvent) => {
        if (this.readStoredTheme() === null) {
          this.setTheme(event.matches ? 'dark' : 'light', false);
        }
      };
      media.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark', true);
  }

  private setTheme(theme: Theme, persist: boolean): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    if (persist) {
      this.writeStoredTheme(theme);
    }
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      // Storage can be blocked (privacy settings); the theme then lasts one session.
      return null;
    }
  }

  private readStoredTheme(): Theme | null {
    const value = this.storage()?.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }

  private writeStoredTheme(theme: Theme): void {
    this.storage()?.setItem(THEME_KEY, theme);
  }

  private crumbsFor(url: string): Crumb[] {
    const root: Crumb = { label: 'Hero Ops', link: '/dashboard' };
    const [section] = url.split(/[?#]/)[0].split('/').filter(Boolean);

    if (section === 'detail') {
      return [root, { label: 'Roster', link: '/roster' }, { label: 'Hero detail' }];
    }

    const item = NAV_ITEMS.find((navItem) => navItem.path === `/${section}`);
    return item ? [root, { label: item.label }] : [root];
  }
}
