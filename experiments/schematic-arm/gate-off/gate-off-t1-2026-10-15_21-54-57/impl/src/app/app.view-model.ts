import { DestroyRef, DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type Theme = 'light' | 'dark';

/** What the operator picked. `system` follows the operating system and is the choice until one is stored. */
export type ThemeChoice = Theme | 'system';

export interface Destination {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly path: string;
}

const THEME_KEY = 'hero-ops-theme';

export const DESTINATIONS: readonly Destination[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
  { path: '/roster', label: 'Roster', icon: 'lucideUsers' },
  { path: '/missions', label: 'Missions', icon: 'lucideTarget' },
  { path: '/threats', label: 'Threats', icon: 'lucideShieldAlert' },
  { path: '/recruit', label: 'Recruit', icon: 'lucideUserPlus' },
  { path: '/settings', label: 'Settings', icon: 'lucideSettings' },
];

// Owns the shell's state: the theme, and the breadcrumb derived from the route.
// Component-scoped (provided by App), so it has no providedIn.
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly systemDark = this.window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly destinations = DESTINATIONS;

  private readonly systemPrefersDark = signal(this.systemDark?.matches ?? false);
  private readonly choice = signal<ThemeChoice>(this.storedChoice());
  readonly themeChoice = this.choice.asReadonly();
  readonly isDark = computed(() => {
    const choice = this.choice();
    return choice === 'system' ? this.systemPrefersDark() : choice === 'dark';
  });
  readonly nextThemeLabel = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<readonly Crumb[]>(() => {
    const [section, id] = this.url().split(/[?#]/)[0].split('/').filter(Boolean);
    const crumbs: Crumb[] = [{ label: 'Hero Ops', path: '/dashboard' }];
    if (section === 'detail') {
      crumbs.push(
        { label: 'Roster', path: '/roster' },
        { label: id ? `Hero ${id}` : 'Hero', path: this.url() },
      );
    } else {
      const destination = DESTINATIONS.find((d) => d.path === `/${section}`);
      if (destination) crumbs.push({ label: destination.label, path: destination.path });
    }
    return crumbs;
  });

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });

    const onSystemChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
    this.systemDark?.addEventListener('change', onSystemChange);
    this.destroyRef.onDestroy(() => this.systemDark?.removeEventListener('change', onSystemChange));
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  /** Stores the choice. `system` clears the stored value, so the console goes back to following the OS. */
  setTheme(choice: ThemeChoice): void {
    this.choice.set(choice);
    if (choice === 'system') {
      this.window?.localStorage.removeItem(THEME_KEY);
    } else {
      this.window?.localStorage.setItem(THEME_KEY, choice);
    }
  }

  private storedChoice(): ThemeChoice {
    const value = this.window?.localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  }
}
