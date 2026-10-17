import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { filter, map } from 'rxjs';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'hero-ops-theme';

// The shell's state: the theme, the breadcrumb, and the topbar search.
// Component-scoped (no providedIn); App provides it, the topbar injects it.
@Injectable()
export class AppShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly view = this.document.defaultView;
  private readonly systemQuery =
    this.view && typeof this.view.matchMedia === 'function'
      ? this.view.matchMedia('(prefers-color-scheme: dark)')
      : null;

  // null until the user chooses; until then the system preference decides.
  private readonly storedTheme = signal<Theme | null>(this.readStoredTheme());
  private readonly systemPrefersDark = signal(this.systemQuery?.matches ?? false);

  readonly dark = computed(() => (this.storedTheme() ?? (this.systemPrefersDark() ? 'dark' : 'light')) === 'dark');
  readonly themeAction = computed(() =>
    this.dark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  readonly crumb = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentCrumb()),
    ),
    { initialValue: this.currentCrumb() },
  );

  constructor() {
    if (this.systemQuery) {
      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      this.systemQuery.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => this.systemQuery?.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  toggleTheme(): void {
    const next: Theme = this.dark() ? 'light' : 'dark';
    this.storedTheme.set(next);
    this.writeStoredTheme(next);
  }

  search(query: string): void {
    const term = query.trim();
    void this.router.navigate(['/roster'], { queryParams: term ? { q: term } : {} });
  }

  // The deepest route's `crumb` data label; the root is the dashboard.
  private currentCrumb(): string {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    let crumb = 'Dashboard';
    while (route.firstChild) {
      route = route.firstChild;
      const label: unknown = route.data['crumb'];
      if (typeof label === 'string') crumb = label;
    }
    return crumb;
  }

  private readStoredTheme(): Theme | null {
    try {
      const value = this.view?.localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private writeStoredTheme(theme: Theme): void {
    try {
      this.view?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage is unavailable (private mode, blocked): the choice lasts this session only.
    }
  }
}
