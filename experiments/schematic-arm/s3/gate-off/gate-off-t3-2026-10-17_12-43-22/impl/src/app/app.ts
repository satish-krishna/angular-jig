import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideRadar,
  lucideSettings,
  lucideShieldAlert,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { AppViewModel } from './app.view-model';
import { Topbar } from './ui/topbar/topbar';

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
    HlmTypographyImports,
    Topbar,
  ],
  providers: [
    AppViewModel,
    provideIcons({
      lucideLayoutDashboard,
      lucideRadar,
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
