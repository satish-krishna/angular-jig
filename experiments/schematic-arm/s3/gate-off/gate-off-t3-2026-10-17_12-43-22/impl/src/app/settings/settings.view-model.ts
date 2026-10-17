import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThemeService } from '../theme/theme.service';

// Component-scoped: the settings screen provides it. It owns the appearance choice and the example-data reset.
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);

  public readonly isDark = computed(() => this.theme.theme() === 'dark');

  public readonly following = this.theme.following;

  public setDark(value: boolean): void {
    this.theme.set(value ? 'dark' : 'light');
  }

  public followSystem(): void {
    this.theme.followSystem();
  }

  public resetData(): void {
    this.heroes.reset();
    this.missions.reset();
  }
}
