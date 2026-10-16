import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface Crumb {
  readonly label: string;
  readonly link?: string;
}

const THEME_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

@Injectable()
export class ShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly window = this.document.defaultView;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** A stored choice wins; with none, the OS preference decides. */
  private userChose = this.readStoredTheme() !== null;
  readonly theme = signal<Theme>(this.readStoredTheme() ?? this.systemTheme());
  readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const [section = 'dashboard', id] = this.url()
      .split(/[?#]/)[0]
      .split('/')
      .filter(Boolean);
    const home: Crumb = { label: 'Hero Ops', link: '/dashboard' };

    if (section === 'detail') {
      return [home, { label: 'Roster', link: '/roster' }, { label: `Hero ${id ?? ''}`.trim() }];
    }
    return [home, { label: SECTION_LABELS[section] ?? 'Dashboard' }];
  });

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    });

    const media = this.window?.matchMedia?.(DARK_QUERY);
    const followSystem = (event: MediaQueryListEvent) => {
      if (!this.userChose) this.theme.set(event.matches ? 'dark' : 'light');
    };
    media?.addEventListener('change', followSystem);
    this.destroyRef.onDestroy(() => media?.removeEventListener('change', followSystem));
  }

  /** Opens the roster filtered by the topbar search. A blank search opens the full roster. */
  searchRoster(term: string): void {
    void this.router.navigate(['/roster'], { queryParams: { q: term.trim() || null } });
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.userChose = true;
    this.writeStoredTheme(next);
  }

  private systemTheme(): Theme {
    return this.window?.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = this.window?.localStorage.getItem(THEME_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked (sandboxed frames); fall back to the OS preference.
      return null;
    }
  }

  private writeStoredTheme(theme: Theme): void {
    try {
      this.window?.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The choice still applies for this session.
    }
  }
}
