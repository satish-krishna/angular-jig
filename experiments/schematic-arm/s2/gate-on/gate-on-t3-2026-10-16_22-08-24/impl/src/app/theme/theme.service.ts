import { DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'hero-ops-theme';

/**
 * Owns the light/dark choice. A stored choice always wins; with no choice the
 * theme follows `prefers-color-scheme`, including live changes to it.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly mediaQuery = this.window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly stored = signal<Theme | null>(this.readStoredTheme());
  private readonly systemPrefersDark = signal(this.mediaQuery?.matches ?? false);

  readonly theme = computed<Theme>(() => this.stored() ?? (this.systemPrefersDark() ? 'dark' : 'light'));

  constructor() {
    this.mediaQuery?.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.stored.set(next);
    this.writeStoredTheme(next);
  }

  private readStoredTheme(): Theme | null {
    try {
      const value = this.window?.localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // Storage can be blocked (privacy modes); fall back to the system preference.
      return null;
    }
  }

  private writeStoredTheme(theme: Theme): void {
    try {
      this.window?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The choice still applies for this session; it just will not persist.
    }
  }
}
