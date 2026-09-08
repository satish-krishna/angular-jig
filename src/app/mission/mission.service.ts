import { Injectable, effect, inject, signal } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { ThreatService } from '../threat/threat.service';
import type { Mission } from './mission.model';
import type { MissionFormModel } from './mission.schema';
import { EXAMPLE_MISSIONS } from './mission-example-data';

@Injectable({ providedIn: 'root' })
export class MissionService {
  // Dependencies point one way only: missions know about heroes and threats,
  // never the reverse. A HeroService that imported this would be a cycle.
  private readonly heroService = inject(HeroService);
  private readonly threatService = inject(ThreatService);

  private readonly _missions = signal<Mission[]>(EXAMPLE_MISSIONS);
  private readonly _nextId = signal(Math.max(...EXAMPLE_MISSIONS.map((m) => parseInt(m.id, 10))) + 1);

  readonly missions = this._missions.asReadonly();

  constructor() {
    // Prune references to heroes and threats that no longer exist, so retiring a
    // hero detaches them everywhere. The `changed` guard matters: this effect
    // reads _missions and writes it, so setting an equal-but-newly-allocated
    // array would retrigger the effect forever.
    effect(() => {
      const liveHeroes = new Set(this.heroService.heroes().map((h) => h.id));
      const liveThreats = new Set(this.threatService.threats().map((t) => t.id));
      let changed = false;
      const pruned = this._missions().map((mission) => {
        const heroIds = mission.heroIds.filter((id) => liveHeroes.has(id));
        const threatId = mission.threatId && liveThreats.has(mission.threatId) ? mission.threatId : null;
        if (heroIds.length === mission.heroIds.length && threatId === mission.threatId) return mission;
        changed = true;
        return { ...mission, heroIds, threatId };
      });
      if (changed) this._missions.set(pruned);
    });
  }

  byId(id: string): Mission | undefined {
    return this._missions().find((m) => m.id === id);
  }

  forHero(heroId: string): Mission[] {
    return this._missions().filter((m) => m.heroIds.includes(heroId));
  }

  create(candidate: MissionFormModel): Mission {
    const mission: Mission = { id: String(this._nextId()), heroIds: [], ...candidate };
    this._missions.update((list) => [...list, mission]);
    this._nextId.update((n) => n + 1);
    return mission;
  }

  update(id: string, patch: Partial<MissionFormModel>): void {
    this._missions.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  remove(id: string): void {
    this._missions.update((list) => list.filter((m) => m.id !== id));
  }
}
