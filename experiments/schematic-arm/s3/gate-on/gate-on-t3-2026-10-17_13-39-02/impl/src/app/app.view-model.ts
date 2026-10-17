import { computed, DestroyRef, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export interface Crumb {
  readonly label: string;
  readonly link?: string;
}

type ThemeChoice = 'light' | 'dark';

const THEME_STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

// Shell state: the theme choice and the breadcrumb trail. Component-scoped, provided by App.
@Injectable()
export class AppViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly view = this.document.defaultView;
  // matchMedia is absent in jsdom and some embedded hosts, so it is optional here.
  private readonly systemQuery = this.view?.matchMedia?.(DARK_QUERY) ?? null;

  // null means the user has made no choice, so the system preference decides.
  private readonly choice = signal<ThemeChoice | null>(this.readStoredChoice());
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);

  readonly dark = computed(() =>
    this.choice() === null ? this.systemDark() : this.choice() === 'dark',
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed(() => this.crumbsFor(this.url()));

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });

    const onSystemChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
    this.systemQuery?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => this.systemQuery?.removeEventListener('change', onSystemChange));
  }

  // A top-bar search opens the roster filtered by the text, so the query lives in the URL and the roster reads it.
  search(text: string): void {
    const query = text.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: query || null } });
  }

  toggleTheme(): void {
    const next: ThemeChoice = this.dark() ? 'light' : 'dark';
    this.choice.set(next);
    this.view?.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  private readStoredChoice(): ThemeChoice | null {
    const stored = this.view?.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  private crumbsFor(url: string): readonly Crumb[] {
    const [section = 'dashboard'] = (url.split('?')[0] ?? '').split('/').filter(Boolean);
    if (section === 'detail') {
      return [{ label: 'Roster', link: '/roster' }, { label: 'Hero detail' }];
    }
    return [{ label: SECTION_LABELS[section] ?? 'Dashboard' }];
  }
}
