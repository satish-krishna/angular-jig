import { DestroyRef, DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: 'lucideLayoutDashboard' | 'lucideUsers' | 'lucideTarget' | 'lucideShieldAlert' | 'lucideUserPlus' | 'lucideSettings';
}

const THEME_STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// The seven destinations: the six in the rail, plus hero detail, which is reached from the roster.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

// Breadcrumb label for the first URL segment. Hero detail is a child of the roster.
export function sectionLabel(url: string): string {
  const segment = url.split(/[?#]/)[0].split('/').filter(Boolean)[0] ?? '';
  if (segment === '') return 'Dashboard';
  if (segment === 'detail') return 'Hero detail';
  return NAV_ITEMS.find((item) => item.path === `/${segment}`)?.label ?? 'Hero Ops';
}

// Storage can be unavailable (privacy modes, sandboxed frames); the theme then just is not remembered.
function readStoredTheme(storage: Storage | null | undefined): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storage: Storage | null | undefined, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not remembered; the in-memory choice still applies for this session.
  }
}

@Injectable()
export class AppViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly view = this.document.defaultView;
  private readonly storage = this.view?.localStorage;

  readonly navItems = NAV_ITEMS;

  // The user's explicit choice; null means "follow the system until they choose".
  private readonly choice = signal<Theme | null>(readStoredTheme(this.storage));
  private readonly systemPrefersDark = signal(this.view?.matchMedia?.(DARK_QUERY).matches ?? false);
  readonly isDark = computed(() => (this.choice() ?? (this.systemPrefersDark() ? 'dark' : 'light')) === 'dark');

  readonly section = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => sectionLabel(event.urlAfterRedirects)),
    ),
    { initialValue: sectionLabel(this.router.url) },
  );

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });

    const query = this.view?.matchMedia?.(DARK_QUERY);
    if (query) {
      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      query.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    }
  }

  toggleTheme(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.choice.set(next);
    writeStoredTheme(this.storage, next);
  }
}
