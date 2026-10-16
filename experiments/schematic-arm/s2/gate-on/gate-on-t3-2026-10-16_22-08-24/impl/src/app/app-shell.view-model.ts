import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ThemeService } from './theme/theme.service';

export type NavIcon =
  | 'lucideLayoutDashboard'
  | 'lucideUsers'
  | 'lucideTarget'
  | 'lucideShieldAlert'
  | 'lucideUserPlus'
  | 'lucideSettings';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIcon;
}

// Every destination in the build spec's navigation rail.
const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

/** Example operator for the console chrome; not a real account. */
const OPERATOR = { name: 'Commander Vale', initials: 'CV', clearance: 'Clearance tier 4' };

@Injectable()
export class AppShellViewModel {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly navItems = NAV_ITEMS;
  readonly operator = OPERATOR;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** The current section name for the breadcrumb trail. */
  readonly section = computed(() => {
    const segment = this.url().split(/[?#]/)[0].split('/')[1] ?? '';
    if (segment === 'detail') return 'Hero detail';
    return NAV_ITEMS.find((item) => item.path === `/${segment}`)?.label ?? 'Dashboard';
  });

  readonly isDark = computed(() => this.themeService.theme() === 'dark');
  // The icon shows the mode a click will switch to.
  readonly themeIcon = computed(() => (this.isDark() ? 'lucideSun' : 'lucideMoon'));
  readonly themeLabel = computed(() => (this.isDark() ? 'Switch to light theme' : 'Switch to dark theme'));

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
