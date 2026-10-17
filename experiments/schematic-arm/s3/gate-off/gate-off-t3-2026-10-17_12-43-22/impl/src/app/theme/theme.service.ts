import { computed, DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Owns the light/dark choice. The `.dark` class on <html> is the only switch the
 * stylesheet reads. An explicit choice is persisted; with no choice the system
 * preference is followed, live.
 */
@Service()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _window = this._document.defaultView;

  private readonly _choice = signal<Theme | null>(this.readStoredChoice());
  private readonly _system = signal<Theme>(this.systemTheme());

  public readonly theme = computed<Theme>(() => this._choice() ?? this._system());

  /** True while no choice is stored, so the system preference decides. */
  public readonly following = computed(() => this._choice() === null);

  constructor() {
    const query = this._window?.matchMedia?.(DARK_QUERY);
    query?.addEventListener('change', (event) => {
      this._system.set(event.matches ? 'dark' : 'light');
    });

    effect(() => {
      this._document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    });
  }

  public toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  public set(theme: Theme): void {
    this._choice.set(theme);
    this._window?.localStorage.setItem(STORAGE_KEY, theme);
  }

  public followSystem(): void {
    this._choice.set(null);
    this._window?.localStorage.removeItem(STORAGE_KEY);
  }

  private readStoredChoice(): Theme | null {
    const stored = this._window?.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  private systemTheme(): Theme {
    return this._window?.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
  }
}
