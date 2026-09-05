import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
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
  lucideMenu,
  lucideX,
  lucidePencil,
  lucideTrash2,
  lucideChevronLeft,
  lucideChevronDown,
  lucideUserCheck,
  lucideActivity,
  lucideZap,
  lucideCheck,
  lucideTriangleAlert,
  lucideCrosshair,
} from '@ng-icons/lucide';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { HeroService } from './domain/hero.service';

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
      lucideMenu,
      lucideX,
      lucidePencil,
      lucideTrash2,
      lucideChevronLeft,
      lucideChevronDown,
      lucideUserCheck,
      lucideActivity,
      lucideZap,
      lucideCheck,
      lucideTriangleAlert,
      lucideCrosshair,
    }),
    {
      provide: HeroService,
      useClass: HeroService,
    },
  ]
};
