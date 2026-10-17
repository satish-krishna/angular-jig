import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme.service';

export type NavIcon =
  | 'lucideLayoutDashboard'
  | 'lucideUsers'
  | 'lucideTarget'
  | 'lucideShieldAlert'
  | 'lucideUserPlus'
  | 'lucideSettings';

interface NavEntry {
  readonly path: string;
  readonly label: string;
  readonly icon: NavIcon;
  // Path prefixes that light this entry up. Roster also owns the hero detail screen.
  readonly prefixes: readonly string[];
}

export const NAV: readonly NavEntry[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard', prefixes: ['/dashboard'] },
  { path: '/roster', label: 'Roster', icon: 'lucideUsers', prefixes: ['/roster', '/detail/'] },
  { path: '/missions', label: 'Missions', icon: 'lucideTarget', prefixes: ['/missions'] },
  { path: '/threats', label: 'Threats', icon: 'lucideShieldAlert', prefixes: ['/threats'] },
  { path: '/recruit', label: 'Recruit', icon: 'lucideUserPlus', prefixes: ['/recruit'] },
  { path: '/settings', label: 'Settings', icon: 'lucideSettings', prefixes: ['/settings'] },
];

// The shell's state: the navigation, the crumbs, and the topbar's search and theme controls.
// Component-scoped, so it lives and dies with App. The theme choice itself lives in ThemeService.
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly dark = this.theme.dark;
  readonly themeLabel = computed(() =>
    this.dark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly nav = computed(() => {
    const path = this.url();
    return NAV.map((entry) => ({
      ...entry,
      active: entry.prefixes.some((prefix) => path.startsWith(prefix)),
    }));
  });

  readonly crumbs = computed<string[]>(() => {
    const path = this.url().split(/[?#]/)[0];
    const section = NAV.find((entry) => entry.prefixes.some((prefix) => path.startsWith(prefix)));
    if (!section) {
      return ['Hero Ops Console'];
    }
    if (path.startsWith('/detail/')) {
      return [section.label, `Hero ${path.split('/')[2] ?? ''}`];
    }
    return [section.label];
  });

  // The topbar search is a roster search: it opens the roster with the term already filled in.
  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
