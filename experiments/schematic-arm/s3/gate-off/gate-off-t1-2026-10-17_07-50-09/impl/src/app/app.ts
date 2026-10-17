import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideSettings,
  lucideShield,
  lucideShieldAlert,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmSmall, HlmLarge } from '@spartan-ng/helm/typography';
import { TopBar } from './ui/top-bar/top-bar';
import { AppShellViewModel } from './app-shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmIconImports,
    HlmAvatarImports,
    HlmSidebarImports,
    HlmLarge,
    HlmSmall,
    TopBar,
  ],
  providers: [
    AppShellViewModel,
    provideIcons({
      lucideLayoutDashboard,
      lucideSettings,
      lucideShield,
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
  protected readonly vm = inject(AppShellViewModel);
}
