import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideChevronRight,
  lucideLayoutDashboard,
  lucideMoon,
  lucideRadar,
  lucideSettings,
  lucideShieldAlert,
  lucideSun,
  lucideTarget,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { AppViewModel } from './app.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmSidebarImports,
    HlmTooltipImports,
    HlmTypographyImports,
  ],
  providers: [
    AppViewModel,
    provideIcons({
      lucideBell,
      lucideChevronRight,
      lucideLayoutDashboard,
      lucideMoon,
      lucideRadar,
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
