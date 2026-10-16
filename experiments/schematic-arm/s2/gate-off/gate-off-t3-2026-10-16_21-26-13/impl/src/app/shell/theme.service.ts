import { computed, DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';

// App-wide singleton: the theme is one document-level setting, not screen state.
// Until the user chooses, the operating system's colour scheme decides.
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly systemQuery = this.window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly stored = signal<ThemeChoice | null>(this.readStored());
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);

  /** The user's explicit choice, or null while the operating system decides. */
  readonly preference = this.stored.asReadonly();

  readonly dark = computed(() => (this.stored() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark');

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  toggle(): void {
    this.setPreference(this.dark() ? 'light' : 'dark');
  }

  /** Persists an explicit theme, or clears the choice (null) so the operating system decides again. */
  setPreference(choice: ThemeChoice | null): void {
    this.stored.set(choice);
    if (choice) {
      this.window?.localStorage.setItem(STORAGE_KEY, choice);
    } else {
      this.window?.localStorage.removeItem(STORAGE_KEY);
    }
  }

  private readStored(): ThemeChoice | null {
    const value = this.window?.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }
}
