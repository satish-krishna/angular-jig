import { computed, DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * App-wide theme store. The user's explicit choice is persisted; until they make one,
 * the theme follows `prefers-color-scheme`. The result is applied as a `.dark` class on <html>.
 */
@Service()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _window = this._document.defaultView;
  private readonly _choice = signal<ThemeChoice | null>(this._readStoredChoice());
  private readonly _systemDark = signal<boolean>(this._mediaQuery()?.matches ?? false);

  /** The explicit choice, or null while the user has not chosen (system theme applies). */
  readonly choice = this._choice.asReadonly();
  readonly isDark = computed(() => (this._choice() ?? (this._systemDark() ? 'dark' : 'light')) === 'dark');

  constructor() {
    const media = this._mediaQuery();
    if (media) {
      media.addEventListener('change', (event) => this._systemDark.set(event.matches));
    }

    effect(() => {
      this._document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  /** Records the user's explicit theme choice. The choice is persisted for later visits. */
  setDark(dark: boolean): void {
    const next: ThemeChoice = dark ? 'dark' : 'light';
    this._choice.set(next);
    this._writeStoredChoice(next);
  }

  private _mediaQuery(): MediaQueryList | null {
    return typeof this._window?.matchMedia === 'function' ? this._window.matchMedia(DARK_QUERY) : null;
  }

  private _readStoredChoice(): ThemeChoice | null {
    try {
      const stored = this._window?.localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked (private mode, disabled cookies). The system theme still applies.
      return null;
    }
  }

  private _writeStoredChoice(choice: ThemeChoice): void {
    try {
      this._window?.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The choice still applies for this session.
    }
  }
}
