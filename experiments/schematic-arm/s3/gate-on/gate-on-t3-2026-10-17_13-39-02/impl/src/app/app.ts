import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideSettings,
  lucideShieldAlert,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AppTopbar } from './ui/app-topbar/app-topbar';
import { AppViewModel } from './app.view-model';

type NavIcon =
  | 'lucideLayoutDashboard'
  | 'lucideUsers'
  | 'lucideTarget'
  | 'lucideShieldAlert'
  | 'lucideUserPlus'
  | 'lucideSettings';

const NAV_ITEMS: readonly { readonly label: string; readonly path: string; readonly icon: NavIcon }[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmAvatarImports,
    HlmIconImports,
    HlmSidebarImports,
    AppTopbar,
  ],
  providers: [
    AppViewModel,
    provideIcons({
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
  protected readonly vm = inject(AppViewModel);
  protected readonly navItems = NAV_ITEMS;
}
