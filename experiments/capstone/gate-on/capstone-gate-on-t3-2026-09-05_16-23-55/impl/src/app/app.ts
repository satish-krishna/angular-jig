import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarHeader,
  HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarMenu,
  HlmSidebarMenuItem,
  HlmSidebarMenuButton,
} from '../../libs/ui/sidebar/src';
import { HlmButton } from '../../libs/ui/button/src';
import { HlmInput } from '../../libs/ui/input/src';
import {
  HlmAvatar,
  HlmAvatarImage,
  HlmAvatarFallback,
} from '../../libs/ui/avatar/src';
import { NgIconsModule } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideUsers,
  lucideTarget,
  lucideShieldAlert,
  lucideUserPlus,
  lucideSettings,
  lucideSun,
  lucideMoon,
  lucideSearch,
  lucideBell,
  lucideMenu,
} from '@ng-icons/lucide';
import { AppViewModel } from './app.view-model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarHeader,
    HlmSidebarFooter,
    HlmSidebarGroup,
    HlmSidebarGroupContent,
    HlmSidebarMenu,
    HlmSidebarMenuItem,
    HlmSidebarMenuButton,
    HlmButton,
    HlmInput,
    HlmAvatar,
    HlmAvatarImage,
    HlmAvatarFallback,
    NgIconsModule,
  ],
  providers: [
    AppViewModel,
    {
      provide: 'ICONS',
      useValue: {
        lucideLayoutDashboard,
        lucideUsers,
        lucideTarget,
        lucideShieldAlert,
        lucideUserPlus,
        lucideSettings,
        lucideSun,
        lucideMoon,
        lucideSearch,
        lucideBell,
        lucideMenu,
      },
    },
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly vm = inject(AppViewModel);
}
