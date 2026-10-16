import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './theme.service';

/**
 * State for the application shell: the breadcrumb (read from the deepest active route)
 * and the theme. Provided by the App component, so it is scoped to the shell.
 */
@Injectable()
export class ShellViewModel {
  private readonly _router = inject(Router);
  private readonly _themeService = inject(ThemeService);

  public readonly theme = this._themeService.theme;

  // The crumb is the `crumb` route data of the deepest active route. It is read again on
  // every navigation, so a reused component never shows a stale title.
  public readonly crumb = toSignal(
    this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this._currentCrumb()),
    ),
    { initialValue: this._currentCrumb() },
  );

  public toggleTheme(): void {
    this._themeService.toggle();
  }

  /** A top-bar search opens the roster filtered by the text. An empty search clears the filter. */
  public search(query: string): void {
    const text = query.trim();
    void this._router.navigate(['/roster'], { queryParams: { q: text === '' ? null : text } });
  }

  private _currentCrumb(): string {
    let route: ActivatedRouteSnapshot = this._router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const crumb: unknown = route.data['crumb'];
    return typeof crumb === 'string' ? crumb : '';
  }
}
