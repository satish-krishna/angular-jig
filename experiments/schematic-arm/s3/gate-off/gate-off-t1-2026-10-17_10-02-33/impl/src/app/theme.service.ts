import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, computed, effect, inject, signal } from '@angular/core';

// 'system' follows the operating system and is the default until the user picks a theme.
export type ThemeChoice = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'hero-ops-theme';
const CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark'];

// The theme choice for the whole console. Root-provided, so the shell and the settings screen share one choice.
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly view = this.document.defaultView;
  // jsdom and some embedded hosts have no matchMedia; with none, the OS preference is simply unknown.
  private readonly media =
    this.view && typeof this.view.matchMedia === 'function'
      ? this.view.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly stored = signal<ThemeChoice>(this.readStored());
  private readonly systemDark = signal<boolean>(this.media?.matches ?? false);

  readonly choice = this.stored.asReadonly();
  readonly dark = computed(() => {
    const choice = this.stored();
    return choice === 'dark' || (choice === 'system' && this.systemDark());
  });

  constructor() {
    if (this.media) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      this.media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
    });
  }

  choose(choice: ThemeChoice): void {
    this.stored.set(choice);
    this.view?.localStorage.setItem(THEME_STORAGE_KEY, choice);
  }

  toggle(): void {
    this.choose(this.dark() ? 'light' : 'dark');
  }

  private readStored(): ThemeChoice {
    const value = this.view?.localStorage.getItem(THEME_STORAGE_KEY);
    return CHOICES.find((choice) => choice === value) ?? 'system';
  }
}
