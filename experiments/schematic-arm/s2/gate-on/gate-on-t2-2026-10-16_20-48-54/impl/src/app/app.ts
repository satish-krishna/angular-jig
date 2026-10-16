import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideChevronRight,
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
import { ShellViewModel } from './shell/shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    ...HlmAvatarImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmSidebarImports,
    ...HlmTooltipImports,
  ],
  providers: [
    ShellViewModel,
    provideIcons({
      lucideBell,
      lucideChevronRight,
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
  protected readonly vm = inject(ShellViewModel);
}
