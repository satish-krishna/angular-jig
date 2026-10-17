import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { AppTopbar } from './ui/app-topbar/app-topbar';
import { AppViewModel } from './app.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmIcon,
    HlmAvatarImports,
    HlmSidebarImports,
    HlmTypographyImports,
    AppTopbar,
  ],
  providers: [
    AppViewModel,
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
  protected readonly vm = inject(AppViewModel);
}
