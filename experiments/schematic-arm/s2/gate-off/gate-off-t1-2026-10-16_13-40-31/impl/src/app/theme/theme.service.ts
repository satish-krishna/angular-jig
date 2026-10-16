import { DestroyRef, DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const THEME_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredPreference(win: Window | null): ThemePreference {
  try {
    const value = win?.localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/**
 * The colour theme. Until the user picks one, it follows the operating system's scheme and
 * keeps following it as that changes. The `dark` class on <html> carries the choice.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly win = this.document.defaultView;
  private readonly systemDark = this.win?.matchMedia?.(DARK_QUERY) ?? null;
  private readonly systemIsDark = signal(this.systemDark?.matches ?? false);

  readonly preference = signal<ThemePreference>(readStoredPreference(this.win));
  readonly isDark = computed(() => {
    const preference = this.preference();
    return preference === 'system' ? this.systemIsDark() : preference === 'dark';
  });

  constructor() {
    effect(() => this.document.documentElement.classList.toggle('dark', this.isDark()));

    const onSystemChange = (event: MediaQueryListEvent) => this.systemIsDark.set(event.matches);
    this.systemDark?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() =>
      this.systemDark?.removeEventListener('change', onSystemChange),
    );
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    try {
      if (preference === 'system') {
        this.win?.localStorage.removeItem(THEME_KEY);
      } else {
        this.win?.localStorage.setItem(THEME_KEY, preference);
      }
    } catch {
      // Storage is unavailable (private mode, blocked cookies): the choice still applies this visit.
    }
  }

  /** Flips to the opposite of what is showing now. */
  toggle(): void {
    this.setPreference(this.isDark() ? 'light' : 'dark');
  }
}
