import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme.service';

const SECTION_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  roster: 'Roster',
  heroes: 'Roster',
  detail: 'Hero detail',
  missions: 'Missions',
  threats: 'Threats',
  recruit: 'Recruit',
  settings: 'Settings',
};

@Injectable()
export class AppViewModel {
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly dark = this.theme.dark;
  readonly themeLabel = computed(() => (this.dark() ? 'Switch to light theme' : 'Switch to dark theme'));

  /** The breadcrumb's current section, read from the first URL segment. */
  readonly section = computed(() => {
    const first = this.url().split(/[/?#]/).find((segment) => segment.length > 0);
    return (first && SECTION_LABELS[first]) || SECTION_LABELS['dashboard'];
  });

  toggleTheme(): void {
    this.theme.toggle();
  }
}
