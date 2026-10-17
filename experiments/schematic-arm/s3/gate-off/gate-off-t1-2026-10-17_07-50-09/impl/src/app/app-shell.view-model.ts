import { DestroyRef, DOCUMENT, computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export const THEME_STORAGE_KEY = 'hero-ops-theme';

type ThemeChoice = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';

// Breadcrumb trail per top-level route segment. Keys match the paths in app.routes.ts.
const CRUMBS: Readonly<Record<string, readonly string[]>> = {
  dashboard: ['Dashboard'],
  roster: ['Roster'],
  heroes: ['Roster'],
  detail: ['Roster', 'Hero detail'],
  missions: ['Missions'],
  threats: ['Threats'],
  recruit: ['Recruit'],
  settings: ['Settings'],
};

@Injectable() // no providedIn: scoped to the App component that provides it
export class AppShellViewModel {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.document.defaultView?.localStorage ?? null;

  // The user's explicit choice, or null when they have not chosen and the system decides.
  private readonly choice = signal<ThemeChoice | null>(this.readChoice());
  private readonly systemDark = signal(this.readSystemDark());

  readonly isDark = computed(() => (this.choice() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark');

  // Current URL, converted at the edge. Read on every navigation, so it stays current
  // even when the router reuses this component.
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<readonly string[]>(() => {
    const section = this.url().split(/[/?#]/).filter(Boolean)[0] ?? 'dashboard';
    return CRUMBS[section] ?? CRUMBS['dashboard'];
  });

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });

    const query = this.document.defaultView?.matchMedia?.(DARK_QUERY);
    if (query) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }
  }

  toggleTheme(): void {
    const next: ThemeChoice = this.isDark() ? 'light' : 'dark';
    this.choice.set(next);
    this.writeChoice(next);
  }

  private readChoice(): ThemeChoice | null {
    try {
      const stored = this.storage?.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked (private mode, disabled cookies). Fall back to the system.
      return null;
    }
  }

  private writeChoice(choice: ThemeChoice): void {
    try {
      this.storage?.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      // The choice still applies for this session; it just will not persist.
    }
  }

  private readSystemDark(): boolean {
    return this.document.defaultView?.matchMedia?.(DARK_QUERY).matches ?? false;
  }
}
