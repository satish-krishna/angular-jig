import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupLabel,
  HlmSidebarHeader,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem,
  HlmSidebarTrigger,
} from '@spartan-ng/helm/sidebar';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  HlmAvatar,
  HlmAvatarImage,
  HlmAvatarFallback,
} from '@spartan-ng/helm/avatar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { NgIcon } from '@ng-icons/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarFooter,
    HlmSidebarGroup,
    HlmSidebarGroupLabel,
    HlmSidebarHeader,
    HlmSidebarMenu,
    HlmSidebarMenuButton,
    HlmSidebarMenuItem,
    HlmSidebarTrigger,
    HlmButton,
    HlmAvatar,
    HlmAvatarImage,
    HlmAvatarFallback,
    HlmTooltip,
    NgIcon,
  ],
  templateUrl: './app.html',
})
export class App {
  private readonly themeService = inject(ThemeService);
  isDark = this.themeService.isDark;

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
