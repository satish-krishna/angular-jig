import { DestroyRef, DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';

/**
 * Owns the light/dark choice. The choice is persisted; until the user makes one,
 * the theme follows `prefers-color-scheme` and keeps following it as the OS changes.
 */
@Service()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _window = this._document.defaultView;
  private readonly _media =
    typeof this._window?.matchMedia === 'function'
      ? this._window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private _stored: Theme | null = this.readStored();

  public readonly theme = signal<Theme>(this._stored ?? (this._media?.matches ? 'dark' : 'light'));

  constructor() {
    effect(() => {
      this._document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    });

    const onSchemeChange = (event: MediaQueryListEvent) => {
      if (this._stored === null) this.theme.set(event.matches ? 'dark' : 'light');
    };
    this._media?.addEventListener('change', onSchemeChange);
    inject(DestroyRef).onDestroy(() => this._media?.removeEventListener('change', onSchemeChange));
  }

  public toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this._stored = next;
    this.writeStored(next);
    this.theme.set(next);
  }

  private readStored(): Theme | null {
    try {
      const value = this._window?.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // Storage can be blocked (privacy modes); fall back to the system preference.
      return null;
    }
  }

  private writeStored(theme: Theme): void {
    try {
      this._window?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Not persisted, but the toggle still works for this session.
    }
  }
}
