import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
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
  lucidePlus,
  lucideFlag,
} from '@ng-icons/lucide';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSpartanHlm(),
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
      lucidePlus,
      lucideFlag,
    }),
  ],
};
