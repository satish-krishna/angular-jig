import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const html = document.documentElement;
      if (this.isDark()) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.isDark.update(v => !v);
  }

  setTheme(theme: Theme) {
    this.isDark.set(theme === 'dark');
  }

  get isDark$() {
    return this.isDark.asReadonly();
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
