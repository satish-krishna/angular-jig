import { toSignal } from '@angular/core/rxjs-interop';
import { Injectable, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme/theme.service';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly path?: string;
}

// The hero detail screen is reached from the roster, so it is not a rail destination.
const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
  { path: '/roster', label: 'Roster', icon: 'lucideUsers' },
  { path: '/missions', label: 'Missions', icon: 'lucideTarget' },
  { path: '/threats', label: 'Threats', icon: 'lucideShieldAlert' },
  { path: '/recruit', label: 'Recruit', icon: 'lucideUserPlus' },
  { path: '/settings', label: 'Settings', icon: 'lucideSettings' },
];

const SECTION_LABELS: Partial<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  missions: 'Missions',
  recruit: 'Recruit',
  threats: 'Threats',
  settings: 'Settings',
};

/** Shell state: navigation, breadcrumbs, the topbar search and the theme toggle. Component-scoped. */
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly navItems = NAV_ITEMS;
  readonly themeIcon = computed(() => (this.theme.isDark() ? 'lucideSun' : 'lucideMoon'));
  readonly themeLabel = computed(() =>
    this.theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: '/' },
  );

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const [section = '', id] = this.url().split(/[?#]/)[0].split('/').filter(Boolean);
    if (section === 'detail' && id) {
      return [{ label: 'Roster', path: '/roster' }, { label: `Hero ${id}` }];
    }
    return [{ label: SECTION_LABELS[section] ?? 'Dashboard' }];
  });

  toggleTheme(): void {
    this.theme.toggle();
  }

  /** The topbar search finds heroes, so it opens the roster filtered to the term. */
  search(term: string): void {
    void this.router.navigate(['/roster'], { queryParams: { q: term.trim() || null } });
  }
}
