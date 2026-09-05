import { Component, OnInit, signal, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideUsers,
  lucideTarget,
  lucideShieldAlert,
  lucideUserPlus,
  lucideSettings,
  lucideSun,
  lucideMoon,
  lucideSearch,
  lucideBell,
  lucideChevronRight,
  lucideMenu,
  lucidePencil,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NgIconsModule,
    HlmSidebarImports,
    HlmButton,
    HlmInput,
    HlmTooltipImports,
    HlmAvatarImports,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideUsers,
      lucideTarget,
      lucideShieldAlert,
      lucideUserPlus,
      lucideSettings,
      lucideSun,
      lucideMoon,
      lucideSearch,
      lucideBell,
      lucideChevronRight,
      lucideMenu,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private darkMode = signal<boolean | null>(null);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initTheme();
  }

  private initTheme(): void {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      this.darkMode.set(stored === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
    }
    this.applyTheme();

    effect(() => {
      this.applyTheme();
      localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
    });
  }

  private applyTheme(): void {
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  isDarkTheme(): boolean {
    return this.darkMode() ?? false;
  }

  toggleTheme(): void {
    this.darkMode.update((v) => !v);
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  getCurrentPageTitle(): string {
    const segments = this.router.url.split('/').filter((s) => s);
    if (!segments.length) return 'Dashboard';
    const pageMap: Record<string, string> = {
      dashboard: 'Dashboard',
      roster: 'Roster',
      missions: 'Missions',
      threats: 'Threats',
      recruit: 'Recruit',
      settings: 'Settings',
      detail: 'Hero Detail',
    };
    return pageMap[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  }

  openMobileMenu(): void {
    // TODO: Trigger mobile sidebar. This will be handled by spartan's sidebar mobile behavior.
  }
}
