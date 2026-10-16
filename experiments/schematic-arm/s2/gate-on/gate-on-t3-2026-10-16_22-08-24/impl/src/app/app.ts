import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideMoon,
  lucideSearch,
  lucideSettings,
  lucideShield,
  lucideShieldAlert,
  lucideSun,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
  lucideBell,
} from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { AppShellViewModel } from './app-shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmSidebarImports,
    HlmButton,
    HlmInput,
    HlmTooltip,
    HlmAvatar,
    HlmAvatarFallback,
  ],
  providers: [
    AppShellViewModel,
    provideIcons({
      lucideBell,
      lucideLayoutDashboard,
      lucideMoon,
      lucideSearch,
      lucideSettings,
      lucideShield,
      lucideShieldAlert,
      lucideSun,
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
