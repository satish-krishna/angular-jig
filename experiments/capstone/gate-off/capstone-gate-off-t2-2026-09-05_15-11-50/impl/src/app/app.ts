import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import {
  HlmSidebar,
  HlmSidebarMenu,
  HlmSidebarTrigger,
  HlmSidebarInset,
} from '@spartan-ng/helm/sidebar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { ThemeService } from './services/theme.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NgIconsModule,
    HlmSidebar,
    HlmSidebarMenu,
    HlmSidebarTrigger,
    HlmSidebarInset,
    HlmButton,
    HlmInput,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private themeService = inject(ThemeService);
  protected router = inject(Router);

  theme = this.themeService.theme;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
    { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
    { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
    { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
    { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
  ];

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
