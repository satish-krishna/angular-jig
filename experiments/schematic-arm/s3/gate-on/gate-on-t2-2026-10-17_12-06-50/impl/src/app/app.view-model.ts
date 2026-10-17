import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme/theme.service';

export type NavIconName =
  | 'lucideLayoutDashboard'
  | 'lucideUsers'
  | 'lucideTarget'
  | 'lucideShieldAlert'
  | 'lucideUserPlus'
  | 'lucideSettings';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIconName;
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
  detail: 'Hero detail',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

@Injectable()
export class AppViewModel {
  private readonly _router = inject(Router);
  private readonly _theme = inject(ThemeService);

  private readonly _url = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this._router.url },
  );

  public readonly navItems = NAV_ITEMS;
  public readonly isDark = this._theme.isDark;

  public readonly themeLabel = computed(() =>
    this._theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  // Breadcrumb trail for the current route. Unknown sections fall back to the brand alone.
  public readonly crumbs = computed<string[]>(() => {
    const path = this._url().split(/[?#]/)[0] ?? '';
    const [section] = path.split('/').filter(Boolean);
    const label = section ? SECTION_LABELS[section] : undefined;
    return label ? ['Hero Ops', label] : ['Hero Ops'];
  });

  public toggleTheme(): void {
    this._theme.toggle();
  }
}
