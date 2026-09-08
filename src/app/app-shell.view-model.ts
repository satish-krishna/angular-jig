import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { PreferencesService } from './preferences/preferences.service';

@Injectable()
export class AppShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly preferences = inject(PreferencesService);

  readonly isDark = computed(() => this.preferences.isDark());
  readonly theme = computed(() => this.preferences.theme());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme(): void {
    this.preferences.setTheme(this.preferences.isDark() ? 'light' : 'dark');
  }
}
