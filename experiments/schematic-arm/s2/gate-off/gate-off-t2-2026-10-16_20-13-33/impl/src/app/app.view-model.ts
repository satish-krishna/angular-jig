import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { NAV_ITEMS } from './app.nav';
import { ThemeService } from './theme/theme.service';

/** A URL segment's breadcrumb label: a nav destination, the hero detail page, or a record id. */
function sectionLabel(segment: string): string {
  const item = NAV_ITEMS.find((nav) => nav.path === `/${segment}`);
  if (item) return item.label;
  return segment === 'detail' ? 'Hero detail' : `#${segment}`;
}

/** The shell's state: theme, breadcrumb, and search. The App component holds none of it. */
@Injectable()
export class AppViewModel {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly navItems = NAV_ITEMS;
  readonly dark = this.theme.dark;

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed(() => {
    const segments = this.path().split(/[?#]/)[0].split('/').filter(Boolean);
    return ['Console', ...segments.map(sectionLabel)];
  });

  toggleTheme(): void {
    this.theme.toggle();
  }

  search(term: string): void {
    const query = term.trim();
    if (!query) return;
    void this.router.navigate(['/roster'], { queryParams: { q: query } });
  }
}
