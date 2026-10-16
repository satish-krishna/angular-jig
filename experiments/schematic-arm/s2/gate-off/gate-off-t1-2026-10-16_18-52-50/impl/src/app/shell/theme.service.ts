import { DestroyRef, DOCUMENT, effect, inject, signal, computed, Service } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

/** What the user has asked for. `system` means no choice has been made, so the OS decides. */
export type ThemePreference = ThemeMode | 'system';

const STORAGE_KEY = 'hero-ops-theme';

/**
 * Owns the light/dark choice. The choice is persisted once the user makes one;
 * until then the OS `prefers-color-scheme` decides, and follows it live.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly systemQuery = this.window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly choice = signal<ThemeMode | null>(this.readStoredChoice());
  private readonly systemMode = signal<ThemeMode>(this.systemQuery?.matches ? 'dark' : 'light');

  /** The user's stated preference, including "follow the system". */
  readonly preference = computed<ThemePreference>(() => this.choice() ?? 'system');
  readonly mode = computed<ThemeMode>(() => this.choice() ?? this.systemMode());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    const onSystemChange = (event: MediaQueryListEvent) =>
      this.systemMode.set(event.matches ? 'dark' : 'light');
    this.systemQuery?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() =>
      this.systemQuery?.removeEventListener('change', onSystemChange),
    );

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggle(): void {
    this.setPreference(this.isDark() ? 'light' : 'dark');
  }

  setPreference(next: ThemePreference): void {
    if (next === 'system') {
      this.choice.set(null);
      this.clearStoredChoice();
      return;
    }
    this.choice.set(next);
    this.writeStoredChoice(next);
  }

  private readStoredChoice(): ThemeMode | null {
    try {
      const stored = this.window?.localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); fall back to the OS.
      return null;
    }
  }

  private writeStoredChoice(mode: ThemeMode): void {
    try {
      this.window?.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // The choice still applies for this session; it just will not survive a reload.
    }
  }

  private clearStoredChoice(): void {
    try {
      this.window?.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing was persisted if storage is unavailable, so there is nothing to clear.
    }
  }
}
