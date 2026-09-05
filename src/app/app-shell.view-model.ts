import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AppShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  readonly isDark = signal(this.readInitialPreference());

  constructor() {
    effect(() => {
      const isDark = this.isDark();
      this.document.documentElement.classList.toggle('dark', isDark);
    });
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
  }

  private readInitialPreference(): boolean {
    return this.prefersDark.matches;
  }
}
