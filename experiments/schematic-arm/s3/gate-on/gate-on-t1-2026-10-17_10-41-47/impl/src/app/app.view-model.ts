import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme/theme.service';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

/** The six rail destinations from the build spec. Hero detail is reached from the roster, not the rail. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

const SECTION_TITLES: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  detail: 'Roster',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

const CONSOLE_NAME = 'Hero Ops';

/** Component-scoped ViewModel for the application shell. */
@Injectable()
export class AppViewModel {
  private readonly _router = inject(Router);
  private readonly _theme = inject(ThemeService);

  readonly navItems = NAV_ITEMS;
  readonly isDark = this._theme.isDark;

  private readonly _url = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this._router.url },
  );

  /** Breadcrumb trail. The last entry is the current page. */
  readonly crumbs = computed<readonly string[]>(() => {
    const [section, id] = this._url().split('?')[0].split('/').filter(Boolean);
    const title = SECTION_TITLES[section] ?? CONSOLE_NAME;
    return section === 'detail' ? [CONSOLE_NAME, title, `Hero ${id ?? ''}`.trim()] : [CONSOLE_NAME, title];
  });

  toggleTheme(): void {
    this._theme.toggle();
  }

  /** The topbar search opens the roster filtered to the text. An empty search clears the filter. */
  search(term: string): void {
    const query = term.trim();
    void this._router.navigate(['/roster'], { queryParams: { q: query || null } });
  }
}
