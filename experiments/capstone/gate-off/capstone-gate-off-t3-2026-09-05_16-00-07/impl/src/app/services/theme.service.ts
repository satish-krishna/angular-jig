import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isDarkSignal = signal<boolean>(this.getInitialTheme());
  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    effect(() => {
      const isDark = this.isDarkSignal();
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDarkSignal.update((v) => !v);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
