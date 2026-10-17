import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

interface RouteCrumb {
  readonly section?: string;
  readonly title?: string;
}

const THEME_KEY = 'hero-ops-console.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// The seven destinations in the build spec. The hero detail route is reached from the
// roster, so it has no rail entry of its own.
const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

/**
 * Shell state: the theme choice and the breadcrumb trail. Component-scoped, so each app
 * instance owns its own state and nothing here is a root-level store.
 */
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly view = this.document.defaultView;
  // Not every environment has matchMedia (the unit-test DOM does not), so it is optional.
  private readonly media = this.darkQuery();

  // null means the user has not chosen, so the operating system preference decides.
  private readonly choice = signal<Theme | null>(this.readStoredTheme());
  private readonly systemPrefersDark = signal(this.media?.matches ?? false);
  private readonly navigated = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    { initialValue: null },
  );

  readonly navItems = NAV_ITEMS;
  readonly isDark = computed(
    () => (this.choice() ?? (this.systemPrefersDark() ? 'dark' : 'light')) === 'dark',
  );
  readonly crumbs = computed<readonly string[]>(() => {
    // Re-read the route tree after every navigation, not just on the first render.
    this.navigated();
    const leaf = deepestRoute(this.router.routerState.snapshot.root);
    const data = leaf.data as RouteCrumb;
    return [data.section, data.title].filter((part): part is string => part !== undefined);
  });

  constructor() {
    const onSystemChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
    this.media?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onSystemChange));

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.choice.set(next);
    this.writeStoredTheme(next);
  }

  /** The top-bar search lands on the roster, filtered by the term. An empty term clears the filter. */
  search(term: string): void {
    const query = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }

  private darkQuery(): MediaQueryList | null {
    return typeof this.view?.matchMedia === 'function' ? this.view.matchMedia(DARK_QUERY) : null;
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = this.view?.localStorage.getItem(THEME_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked (private mode, sandboxed frames): fall back to the OS preference.
      return null;
    }
  }

  private writeStoredTheme(theme: Theme): void {
    try {
      this.view?.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Without storage the choice lasts for this visit only.
    }
  }
}

function deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let leaf = route;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return leaf;
}
