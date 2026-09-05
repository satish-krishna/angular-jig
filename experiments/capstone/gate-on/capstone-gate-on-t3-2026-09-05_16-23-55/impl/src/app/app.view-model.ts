import { Injectable, signal, effect } from '@angular/core';

@Injectable()
export class AppViewModel {
  readonly isDark = signal(false);

  constructor() {
    this.initializeTheme();
    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  private initializeTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark.set(true);
    } else {
      this.isDark.set(false);
    }
  }

  private applyTheme(dark: boolean) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleTheme() {
    this.isDark.update((value) => !value);
  }
}
