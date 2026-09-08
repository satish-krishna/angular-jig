import { Injectable, computed, inject, signal } from '@angular/core';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';
import type { MissionFormModel } from '../mission/mission.schema';

@Injectable()
export class MissionsViewModel {
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);

  readonly missions = this.missionService.missions;

  readonly searchQuery = signal('');
  readonly priorityOnly = signal(false);

  /** The id of the mission being edited, '' for a new one, or null when closed. */
  readonly editing = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const priorityOnly = this.priorityOnly();
    return this.missions()
      .filter((m) => !priorityOnly || m.priority)
      .filter((m) => !q || m.codename.toLowerCase().includes(q) || m.objective.toLowerCase().includes(q));
  });

  readonly threatOptions = computed(() =>
    this.threatService.threats().map((t) => ({ value: t.id, label: t.designation })),
  );

  readonly editingMission = computed(() => {
    const id = this.editing();
    return id ? this.missionService.byId(id) : undefined;
  });

  startCreate(): void {
    this.editing.set('');
  }

  startEdit(id: string): void {
    this.editing.set(id);
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(model: MissionFormModel): void {
    const id = this.editing();
    if (id) {
      this.missionService.update(id, model);
    } else {
      this.missionService.create(model);
    }
    this.editing.set(null);
  }

  remove(id: string): void {
    this.missionService.remove(id);
    if (this.editing() === id) this.editing.set(null);
  }
}
