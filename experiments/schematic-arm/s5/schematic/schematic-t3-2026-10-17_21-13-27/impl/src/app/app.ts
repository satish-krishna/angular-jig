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
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { AppTopbar } from './ui/app-topbar/app-topbar';
import { ShellViewModel } from './shell/shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmSidebarImports,
    HlmAvatarImports,
    HlmTypographyImports,
    AppTopbar,
  ],
  providers: [
    ShellViewModel,
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
  protected readonly vm = inject(ShellViewModel);
}
