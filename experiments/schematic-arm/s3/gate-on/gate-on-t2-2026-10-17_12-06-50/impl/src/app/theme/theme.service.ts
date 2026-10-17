import { computed, DestroyRef, DOCUMENT, inject, Injectable, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Owns the light/dark choice. The choice is a `.dark` class on <html>, persisted to
 * localStorage once the user has picked one. Until then the OS preference decides,
 * and a change to that preference is followed live.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _media = this._queryDark();

  // null means the user has made no choice and the system preference applies.
  private readonly _stored = signal<ThemeChoice | null>(this._readStored());
  private readonly _systemDark = signal<boolean>(this._media?.matches ?? false);

  public readonly isDark = computed(() => (this._stored() ?? (this._systemDark() ? 'dark' : 'light')) === 'dark');

  constructor() {
    this._apply(this.isDark());

    if (this._media) {
      const onChange = (event: MediaQueryListEvent) => {
        this._systemDark.set(event.matches);
        this._apply(this.isDark());
      };
      this._media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => this._media?.removeEventListener('change', onChange));
    }
  }

  public toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  public set(choice: ThemeChoice): void {
    this._stored.set(choice);
    this._writeStored(choice);
    this._apply(choice === 'dark');
  }

  private _queryDark(): MediaQueryList | null {
    // matchMedia is absent in jsdom and some embedded hosts; without it the system choice is light.
    const view = this._document.defaultView;
    return view && typeof view.matchMedia === 'function' ? view.matchMedia(DARK_QUERY) : null;
  }

  private _apply(dark: boolean): void {
    this._document.documentElement.classList.toggle('dark', dark);
  }

  private _readStored(): ThemeChoice | null {
    try {
      const value = this._document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // Storage can be blocked (private mode, disabled cookies). Fall back to the system choice.
      return null;
    }
  }

  private _writeStored(choice: ThemeChoice): void {
    try {
      this._document.defaultView?.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Not persisted, but the choice still applies for this session.
    }
  }
}
