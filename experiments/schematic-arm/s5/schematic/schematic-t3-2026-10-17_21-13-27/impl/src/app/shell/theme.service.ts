import { DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';

/**
 * Owns the light/dark choice. An explicit choice is persisted; with no choice
 * the theme follows `prefers-color-scheme`, live, until the user picks one.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemQuery =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);
  private readonly choice = signal<Theme | null>(this.readChoice());

  readonly theme = computed<Theme>(() => this.choice() ?? (this.systemDark() ? 'dark' : 'light'));

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => this.systemDark.set(event.matches));
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    });
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(next: Theme): void {
    this.choice.set(next);
    this.storage()?.setItem(STORAGE_KEY, next);
  }

  private readChoice(): Theme | null {
    const stored = this.storage()?.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      // Storage can be blocked (privacy modes); the theme then lasts for the session only.
      return null;
    }
  }
}
