import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

/** What the user chose: a fixed mode, or 'system' to follow the OS scheme. */
export type ThemePreference = ThemeMode | 'system';

const STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Owns the light/dark choice. The `.dark` class on <html> is the only thing the
 * stylesheet reads. A stored choice wins; with no choice, the system scheme does.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly systemQuery = this.window?.matchMedia?.(DARK_QUERY) ?? null;

  private readonly choice = signal<ThemeMode | null>(this.readStoredChoice());
  private readonly systemDark = signal<boolean>(this.systemQuery?.matches ?? false);

  readonly dark = computed(() => (this.choice() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark');

  /** The stored choice, or 'system' when the user has not picked one. */
  readonly preference = computed<ThemePreference>(() => this.choice() ?? 'system');

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  toggle(): void {
    this.choose(this.dark() ? 'light' : 'dark');
  }

  /** Persist a fixed mode, or clear the stored choice so the system scheme applies again. */
  choose(preference: ThemePreference): void {
    if (preference === 'system') {
      this.choice.set(null);
      this.window?.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    this.choice.set(preference);
    this.window?.localStorage.setItem(STORAGE_KEY, preference);
  }

  private readStoredChoice(): ThemeMode | null {
    const stored = this.window?.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }
}
