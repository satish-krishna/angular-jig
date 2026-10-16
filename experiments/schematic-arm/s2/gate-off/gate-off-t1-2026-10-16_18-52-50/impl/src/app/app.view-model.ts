import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './shell/theme.service';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly link: string | null;
}

const NAVIGATION: readonly NavItem[] = [
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
  detail: 'Hero dossier',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

/** Shell state: the navigation list, the breadcrumb trail and the theme switch. */
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly navigation = NAVIGATION;
  readonly isDark = this.theme.isDark;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const [section] = this.url().split(/[?#]/)[0].split('/').filter(Boolean);
    const sectionLabel = SECTION_LABELS[section];
    const home: Crumb = { label: 'Hero Ops', link: '/dashboard' };
    if (!sectionLabel) return [home];
    if (section === 'detail') return [home, { label: 'Roster', link: '/roster' }, { label: sectionLabel, link: null }];
    return [home, { label: sectionLabel, link: null }];
  });

  toggleTheme(): void {
    this.theme.toggle();
  }

  /** The top-bar search runs on the roster, so a term lands on a filtered roster. An empty term clears the filter. */
  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }
}
