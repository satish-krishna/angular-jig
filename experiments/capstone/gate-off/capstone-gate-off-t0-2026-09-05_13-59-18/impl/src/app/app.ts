import { Component, effect, signal } from '@angular/core';
import { RouterOutlet, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarFooter,
  HlmSidebarHeader,
  HlmSidebarInset,
  HlmSidebarMenuButton,
  HlmSidebarSeparator,
  HlmSidebarTrigger,
} from '@spartan-ng/helm/sidebar';
import {
  HlmAvatar,
  HlmAvatarFallback,
  HlmAvatarImage,
} from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLinkActive,
    NgIcon,
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarFooter,
    HlmSidebarHeader,
    HlmSidebarInset,
    HlmSidebarMenuButton,
    HlmSidebarSeparator,
    HlmSidebarTrigger,
    HlmAvatar,
    HlmAvatarFallback,
    HlmAvatarImage,
    HlmButton,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
  }
}
