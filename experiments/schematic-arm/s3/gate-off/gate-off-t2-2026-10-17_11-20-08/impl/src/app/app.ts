import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCrosshair,
  lucideLayoutDashboard,
  lucideSettings,
  lucideShieldAlert,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { Topbar } from './topbar/topbar';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: 'lucideLayoutDashboard' | 'lucideUsers' | 'lucideTarget' | 'lucideShieldAlert' | 'lucideUserPlus' | 'lucideSettings';
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmIconImports,
    HlmSidebarImports,
    HlmTypographyImports,
    Topbar,
  ],
  providers: [
    provideIcons({
      lucideCrosshair,
      lucideLayoutDashboard,
      lucideSettings,
      lucideShieldAlert,
      lucideTarget,
      lucideUserPlus,
      lucideUsers,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly navItems: readonly NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
    { path: '/roster', label: 'Roster', icon: 'lucideUsers' },
    { path: '/missions', label: 'Missions', icon: 'lucideTarget' },
    { path: '/threats', label: 'Threats', icon: 'lucideShieldAlert' },
    { path: '/recruit', label: 'Recruit', icon: 'lucideUserPlus' },
    { path: '/settings', label: 'Settings', icon: 'lucideSettings' },
  ];
}
