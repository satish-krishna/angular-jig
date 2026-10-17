import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import type { Crumb } from '../../app.view-model';

// Presentational: state comes in through inputs, actions go out through outputs.
@Component({
  selector: 'app-topbar',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmSidebarImports,
    HlmTooltipImports,
  ],
  providers: [provideIcons({ lucideBell, lucideMoon, lucideSearch, lucideSun })],
  templateUrl: './app-topbar.html',
  styleUrl: './app-topbar.css',
})
export class AppTopbar {
  readonly crumbs = input.required<readonly Crumb[]>();
  readonly dark = input.required<boolean>();
  readonly themeToggle = output<void>();
  readonly searchSubmit = output<string>();

  protected readonly themeLabel = computed(() =>
    this.dark() ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
