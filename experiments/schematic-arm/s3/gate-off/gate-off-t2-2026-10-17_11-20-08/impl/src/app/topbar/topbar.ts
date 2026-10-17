import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { AppShellViewModel } from '../app-shell.view-model';

@Component({
  selector: 'app-topbar',
  imports: [
    NgIcon,
    HlmAvatarImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmSidebarImports,
    HlmTooltipImports,
  ],
  providers: [
    AppShellViewModel,
    provideIcons({ lucideBell, lucideMoon, lucideSearch, lucideSun }),
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  protected readonly vm = inject(AppShellViewModel);
}
