import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideCrosshair,
  lucideLayoutDashboard,
  lucideMoon,
  lucideSettings,
  lucideShieldAlert,
  lucideSun,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppViewModel } from './app.view-model';

@Component({
  selector: 'app-root',
  imports: [
    NgIcon,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    HlmAvatarImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSidebarImports,
    HlmTooltipImports,
  ],
  providers: [
    AppViewModel,
    provideIcons({
      lucideBell,
      lucideCrosshair,
      lucideLayoutDashboard,
      lucideMoon,
      lucideSettings,
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
  protected readonly vm = inject(AppViewModel);
}
