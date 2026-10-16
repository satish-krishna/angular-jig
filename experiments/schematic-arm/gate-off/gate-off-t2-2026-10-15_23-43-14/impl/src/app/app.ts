import { Component, inject } from '@angular/core';
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
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppTopbar } from './ui/app-topbar';
import { ShellViewModel } from './shell/shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmAvatar,
    HlmAvatarFallback,
    HlmSidebarImports,
    AppTopbar,
  ],
  providers: [
    ShellViewModel,
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
  protected readonly vm = inject(ShellViewModel);
}
