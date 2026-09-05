import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIcons } from '@ng-icons/core';
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
  lucidePencil,
  lucideTrash2,
  lucideCrosshair,
  lucideChevronLeft,
  lucideChevronDown,
  lucideUserCheck,
  lucideActivity,
  lucideZap,
  lucideCheck,
  lucideTriangleAlert,
  lucideMenu,
  lucideX,
} from '@ng-icons/lucide';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
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
      lucidePencil,
      lucideTrash2,
      lucideCrosshair,
      lucideChevronLeft,
      lucideChevronDown,
      lucideUserCheck,
      lucideActivity,
      lucideZap,
      lucideCheck,
      lucideTriangleAlert,
      lucideMenu,
      lucideX,
    })
  ]
};
