import { Injectable, computed, inject, signal } from '@angular/core';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';
import type { ThreatLevel, ThreatStatus } from '../threat/threat.model';
import type { ThreatFormModel } from '../threat/threat.schema';

@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);
  private readonly missionService = inject(MissionService);

  readonly threats = this.threatService.threats;

  readonly searchQuery = signal('');
  readonly levelFilter = signal<ThreatLevel | 'all'>('all');
  readonly statusFilter = signal<ThreatStatus | 'all'>('all');

  /** The id of the threat being edited, '' for a new one, or null when closed. */
  readonly editing = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const level = this.levelFilter();
    const status = this.statusFilter();
    return this.threats()
      .filter((t) => level === 'all' || t.level === level)
      .filter((t) => status === 'all' || t.status === status)
      .filter((t) => !q || t.designation.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  });

  readonly editingThreat = computed(() => {
    const id = this.editing();
    return id ? this.threatService.byId(id) : undefined;
  });

  missionCount(threatId: string): number {
    return this.missionService.missions().filter((m) => m.threatId === threatId).length;
  }

  startCreate(): void {
    this.editing.set('');
  }

  startEdit(id: string): void {
    this.editing.set(id);
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(model: ThreatFormModel): void {
    const id = this.editing();
    if (id) {
      this.threatService.update(id, model);
    } else {
      this.threatService.create(model);
    }
    this.editing.set(null);
  }

  remove(id: string): void {
    this.threatService.remove(id);
    if (this.editing() === id) this.editing.set(null);
  }
}
