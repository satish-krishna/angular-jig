import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import type { Crumb } from './ui/topbar/topbar';
import { ThemeService } from './theme/theme.service';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
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
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

const HOME: Crumb = { label: 'Hero Ops', link: '/dashboard' };

// Component-scoped: the shell provides it, so each app instance owns its state.
@Injectable()
export class AppViewModel {
  private readonly _theme = inject(ThemeService);
  private readonly _router = inject(Router);

  public readonly navItems = NAV_ITEMS;

  public readonly isDark = computed(() => this._theme.theme() === 'dark');

  private readonly _url = toSignal(
    this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this._router.url },
  );

  public readonly crumbs = computed<Crumb[]>(() => {
    const [section = 'dashboard'] = this._url().split(/[/?#]/).filter(Boolean);
    if (section === 'detail') {
      return [HOME, { label: SECTION_LABELS['roster'], link: '/roster' }, { label: 'Hero detail' }];
    }
    return [HOME, { label: SECTION_LABELS[section] ?? 'Dashboard' }];
  });

  public toggleTheme(): void {
    this._theme.toggle();
  }

  // The topbar search always lands on the roster, which filters by the ?q= it is given.
  public search(term: string): void {
    const query = term.trim();
    void this._router.navigate(['/roster'], { queryParams: { q: query || null } });
  }
}
