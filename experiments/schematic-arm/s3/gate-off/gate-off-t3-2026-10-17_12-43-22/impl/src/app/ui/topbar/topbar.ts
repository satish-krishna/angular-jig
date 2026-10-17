import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideChevronRight, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

export interface Crumb {
  label: string;
  link?: string;
}

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
    HlmTypographyImports,
  ],
  providers: [provideIcons({ lucideBell, lucideChevronRight, lucideMoon, lucideSearch, lucideSun })],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  public readonly crumbs = input.required<Crumb[]>();
  public readonly isDark = input.required<boolean>();
  public readonly themeToggled = output<void>();
  public readonly searched = output<string>();
}
