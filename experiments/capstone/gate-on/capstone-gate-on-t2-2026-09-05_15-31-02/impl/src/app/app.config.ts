import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideLayoutDashboard, lucideUsers, lucideTarget, lucideShieldAlert, lucideUserPlus, lucideSettings, lucideSun, lucideMoon, lucideSearch, lucideBell, lucideUserCheck, lucideActivity, lucideZap, lucidePencil, lucideTrash2, lucideChevronLeft, lucideCrosshair, lucideCheck, lucideTriangleAlert } from '@ng-icons/lucide';
import { routes } from './app.routes';
import { HeroService } from './domain/hero.service';

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
      lucideUserCheck,
      lucideActivity,
      lucideZap,
      lucidePencil,
      lucideTrash2,
      lucideChevronLeft,
      lucideCrosshair,
      lucideCheck,
      lucideTriangleAlert,
    }),
    HeroService,
  ]
};
