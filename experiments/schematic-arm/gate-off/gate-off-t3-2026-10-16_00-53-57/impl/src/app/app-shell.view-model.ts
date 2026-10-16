import { DestroyRef, DOCUMENT, computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'hero-ops-theme';

const SECTION_LABELS: Partial<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  missions: 'Missions',
  recruit: 'Recruit',
  threats: 'Threats',
  settings: 'Settings',
};

export const NAV_ITEMS = [
  { path: 'dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
  { path: 'roster', label: 'Roster', icon: 'lucideUsers' },
  { path: 'missions', label: 'Missions', icon: 'lucideTarget' },
  { path: 'threats', label: 'Threats', icon: 'lucideShieldAlert' },
  { path: 'recruit', label: 'Recruit', icon: 'lucideUserPlus' },
  { path: 'settings', label: 'Settings', icon: 'lucideSettings' },
] as const;

// Owns the shell's theme and breadcrumb state. Provided by App, not root.
@Injectable()
export class AppShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly window = this.document.defaultView;

  readonly navItems = NAV_ITEMS;

  // An explicit choice wins; with none stored, the OS preference decides.
  private readonly choice = signal<Theme | null>(this.readStoredTheme());
  private readonly systemTheme = signal<Theme>('light');
  private readonly theme = computed<Theme>(() => this.choice() ?? this.systemTheme());

  readonly isDark = computed(() => this.theme() === 'dark');
  readonly themeLabel = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<string[]>(() => {
    const [section] = this.url().split(/[/?#]/).filter(Boolean);
    if (section === 'detail') return ['Roster', 'Hero detail'];
    return [SECTION_LABELS[section ?? ''] ?? 'Dashboard'];
  });

  constructor() {
    const query = this.window?.matchMedia?.('(prefers-color-scheme: dark)');
    if (query) {
      this.systemTheme.set(query.matches ? 'dark' : 'light');
      const onChange = (event: MediaQueryListEvent) =>
        this.systemTheme.set(event.matches ? 'dark' : 'light');
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.choice.set(theme);
    this.writeStoredTheme(theme);
  }

  /** Submits the topbar search: the roster filters on the term, carried in the `q` query parameter. */
  search(event: Event, term: string): void {
    event.preventDefault();
    const q = term.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: q || null } });
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = this.window?.localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked; the choice then holds for this session only.
      return null;
    }
  }

  private writeStoredTheme(theme: Theme): void {
    try {
      this.window?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked; the choice then holds for this session only.
    }
  }
}
