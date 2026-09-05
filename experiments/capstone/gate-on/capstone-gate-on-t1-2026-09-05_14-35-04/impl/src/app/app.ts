import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import {
  HlmSidebar,
  HlmSidebarHeader,
  HlmSidebarContent,
  HlmSidebarMenu,
  HlmSidebarGroup,
  HlmSidebarMenuItem,
  HlmSidebarMenuButton,
  HlmSidebarFooter,
  HlmSidebarInset,
  HlmSidebarTrigger,
} from '@spartan-ng/helm/sidebar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
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
} from '@ng-icons/lucide';
import { AppViewModel } from './app.view-model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    NgIconsModule,
    HlmSidebar,
    HlmSidebarHeader,
    HlmSidebarContent,
    HlmSidebarMenu,
    HlmSidebarGroup,
    HlmSidebarMenuItem,
    HlmSidebarMenuButton,
    HlmSidebarFooter,
    HlmSidebarInset,
    HlmSidebarTrigger,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmAvatarImports,
  ],
  providers: [
    AppViewModel,
    provideIcons({
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
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly vm = inject(AppViewModel);
}
