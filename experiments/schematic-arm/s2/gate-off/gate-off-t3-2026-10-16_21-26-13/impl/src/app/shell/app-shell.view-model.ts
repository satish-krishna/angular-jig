import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme.service';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly path?: string;
}

// The six rail destinations. Hero detail is reached from the roster, not the rail.
const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  detail: 'Hero Detail',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

@Injectable()
export class AppShellViewModel {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly nav = NAV_ITEMS;

  readonly darkMode = this.theme.dark;

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const section = this.url().split(/[/?#]/).filter(Boolean)[0] ?? 'dashboard';
    const parent: readonly Crumb[] = section === 'detail' ? [{ label: 'Roster', path: '/roster' }] : [];
    return [{ label: 'Hero Ops', path: '/dashboard' }, ...parent, { label: SECTION_LABELS[section] ?? 'Dashboard' }];
  });

  toggleTheme(): void {
    this.theme.toggle();
  }

  /** Runs the shell search on the roster. An empty term clears the search. */
  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }
}
