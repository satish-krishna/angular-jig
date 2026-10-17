import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';

// The settings screen's state and logic, no DOM. Component-scoped (no providedIn): the
// Settings component provides it.
@Injectable()
export class SettingsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  readonly heroCount = computed(() => this.heroService.heroes().length);
  readonly missionCount = computed(() => this.missionService.missions().length);

  // Puts both the roster and the mission log back to the example data. Every screen reads these
  // services, so the reset shows up everywhere at once.
  resetExampleData(): void {
    this.heroService.reset();
    this.missionService.reset();
  }
}
