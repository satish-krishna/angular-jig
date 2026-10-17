import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { NAV_DESTINATIONS, crumbsFor } from './nav';
import { ThemeService } from './theme.service';

@Injectable()
export class ShellViewModel {
  private readonly router = inject(Router);
  private readonly themes = inject(ThemeService);

  readonly destinations = NAV_DESTINATIONS;
  readonly dark = computed(() => this.themes.theme() === 'dark');
  readonly crumbs = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => crumbsFor(event.urlAfterRedirects)),
    ),
    { initialValue: crumbsFor(this.router.url) },
  );

  toggleTheme(): void {
    this.themes.toggle();
  }

  /** The topbar search lands on the roster, which filters by the same query. */
  search(query: string): void {
    const q = query.trim();
    void this.router.navigate(['/roster'], { queryParams: { q: q || null } });
  }
}
