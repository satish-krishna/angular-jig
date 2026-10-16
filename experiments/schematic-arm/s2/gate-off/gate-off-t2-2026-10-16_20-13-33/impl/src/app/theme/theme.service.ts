import { computed, DOCUMENT, effect, inject, signal, Service } from '@angular/core';

type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'hero-ops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Light/dark theme. The choice is persisted; with no choice the system preference wins.
 * The `dark` class on <html> is what the spartan tokens in styles.css key off.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly media = this.window?.matchMedia?.(DARK_QUERY) ?? null;

  private readonly systemDark = signal(this.media?.matches ?? false);
  private readonly choice = signal<ThemeChoice | null>(this.readStoredChoice());

  readonly dark = computed(() => (this.choice() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark');

  constructor() {
    this.media?.addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  toggle(): void {
    const next: ThemeChoice = this.dark() ? 'light' : 'dark';
    this.choice.set(next);
    this.writeStoredChoice(next);
  }

  private readStoredChoice(): ThemeChoice | null {
    try {
      const stored = this.window?.localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // Storage can be blocked (private mode, disabled cookies); fall back to the system choice.
      return null;
    }
  }

  private writeStoredChoice(choice: ThemeChoice): void {
    try {
      this.window?.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Not persisted, but the choice still applies for this session.
    }
  }
}
