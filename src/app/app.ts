import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { AppShellViewModel } from './app-shell.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmSidebarImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmAvatarImports,
  ],
  providers: [AppShellViewModel],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly vm = inject(AppShellViewModel);
}
