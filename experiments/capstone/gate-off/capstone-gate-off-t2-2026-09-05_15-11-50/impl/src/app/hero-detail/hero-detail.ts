import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucidePencil,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HeroDetailViewModel } from './hero-detail.viewmodel';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIconsModule,
    HlmButtonImports,
    HlmTabsImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmAvatarImports,
    HlmInputImports,
    HlmSelectImports,
    HlmLabelImports,
    HlmSwitchImports,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideChevronLeft,
      lucideCrosshair,
      lucideTrash2,
      lucidePencil,
    }),
  ],
  template: `
    <div class="flex-1 overflow-y-auto">
      @if (vm.hero(); as hero) {
        <div class="p-6">
          <!-- Back Link -->
          <a
            [routerLink]="['/roster']"
            class="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            <ng-icon name="lucideChevronLeft" class="h-4 w-4"></ng-icon>
            <span>Back to roster</span>
          </a>

          <!-- Detail Header -->
          <div class="mb-6 rounded-lg border border-border bg-card p-6">
            <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <!-- Hero Info -->
              <div class="flex gap-4">
                <div hlmAvatar class="h-16 w-16 shrink-0">
                  <img
                    hlmAvatarImage
                    [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + hero.id"
                    [alt]="hero.name"
                  />
                </div>
                <div class="min-w-0">
                  <div class="flex flex-col gap-2">
                    <div>
                      <p class="text-xs font-medium text-muted-foreground">
                        {{ hero.id }}
                      </p>
                      <h1 class="text-2xl font-bold text-foreground">{{ hero.name }}</h1>
                      <p class="text-sm text-muted-foreground">{{ hero.alias }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span hlmBadge variant="secondary">
                        {{ hero.powerClass }}
                      </span>
                      <span
                        hlmBadge
                        [ngStyle]="getStatusStyle(hero.status)"
                        class="font-medium"
                      >
                        {{ hero.status }}
                      </span>
                      <span hlmBadge variant="outline">
                        {{ hero.clearanceTier }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-2 sm:flex-row">
                <button hlmBtn variant="default" class="gap-2">
                  <ng-icon name="lucideCrosshair" class="h-4 w-4"></ng-icon>
                  <span>Deploy</span>
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  class="gap-2"
                  (click)="vm.openRetireDialog()"
                >
                  <ng-icon name="lucideTrash2" class="h-4 w-4"></ng-icon>
                  <span>Retire</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <hlm-tabs [tab]="vm.activeTab()" class="mb-6">
            <div hlmTabsList class="grid w-full grid-cols-4">
              <button
                hlmTabsTrigger
                value="overview"
                (click)="vm.setActiveTab('overview')"
              >
                Overview
              </button>
              <button
                hlmTabsTrigger
                value="powers"
                (click)="vm.setActiveTab('powers')"
              >
                Powers
              </button>
              <button
                hlmTabsTrigger
                value="missions"
                (click)="vm.setActiveTab('missions')"
              >
                Missions
              </button>
              <button
                hlmTabsTrigger
                value="edit"
                (click)="vm.setActiveTab('edit')"
              >
                Edit
              </button>
            </div>

            <!-- Overview Tab -->
            @if (vm.activeTab() === 'overview') {
              <div hlmTabsContent value="overview" class="mt-6">
                <div class="grid gap-6 lg:grid-cols-2">
                  <!-- Field Summary -->
                  <div hlmCard class="p-6">
                    <h3 class="mb-4 text-lg font-semibold text-foreground">
                      Field Summary
                    </h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between border-b border-border pb-3">
                        <span class="text-sm text-muted-foreground">Missions</span>
                        <span class="font-semibold text-foreground">
                          {{ vm.fieldSummary().missions }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between border-b border-border pb-3">
                        <span class="text-sm text-muted-foreground">Success Rate</span>
                        <span class="font-semibold text-foreground">
                          {{ vm.fieldSummary().successRate }}%
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-muted-foreground">Power Index</span>
                        <span class="font-semibold text-foreground">
                          {{ vm.fieldSummary().power }}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Dossier (key/value) -->
                  <div hlmCard class="p-6">
                    <h3 class="mb-4 text-lg font-semibold text-foreground">Dossier</h3>
                    <dl class="space-y-4">
                      <div>
                        <dt class="text-xs font-medium uppercase text-muted-foreground">
                          Name
                        </dt>
                        <dd class="text-sm text-foreground">{{ hero.name }}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium uppercase text-muted-foreground">
                          Alias
                        </dt>
                        <dd class="text-sm text-foreground">{{ hero.alias }}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium uppercase text-muted-foreground">
                          Power Class
                        </dt>
                        <dd class="text-sm text-foreground">{{ hero.powerClass }}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium uppercase text-muted-foreground">
                          Clearance Tier
                        </dt>
                        <dd class="text-sm text-foreground">{{ hero.clearanceTier }}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            }

            <!-- Powers Tab -->
            @if (vm.activeTab() === 'powers') {
              <div hlmTabsContent value="powers" class="mt-6">
                <div class="grid gap-6 lg:grid-cols-2">
                  <!-- Power Meters -->
                  <div hlmCard class="p-6">
                    <h3 class="mb-4 text-lg font-semibold text-foreground">
                      Power Metrics
                    </h3>
                    <div class="space-y-4">
                      <div>
                        <div class="mb-2 flex items-center justify-between">
                          <span class="text-sm font-medium text-foreground">Power Index</span>
                          <span class="text-xs text-muted-foreground">
                            {{ hero.powerIndex }}/100
                          </span>
                        </div>
                        <div
                          class="h-2 w-full rounded-full bg-muted overflow-hidden"
                        >
                          <div
                            class="h-full bg-primary transition-all"
                            [style.width.%]="hero.powerIndex"
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div class="mb-2 flex items-center justify-between">
                          <span class="text-sm font-medium text-foreground">Success Rate</span>
                          <span class="text-xs text-muted-foreground">
                            {{ hero.successRate }}%
                          </span>
                        </div>
                        <div
                          class="h-2 w-full rounded-full bg-muted overflow-hidden"
                        >
                          <div
                            class="h-full bg-success transition-all"
                            [style.width.%]="hero.successRate"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Ability Badges -->
                  <div hlmCard class="p-6">
                    <h3 class="mb-4 text-lg font-semibold text-foreground">
                      Abilities
                    </h3>
                    <div class="flex flex-wrap gap-2">
                      <span hlmBadge>{{ hero.powerClass }} Mastery</span>
                      <span hlmBadge variant="secondary">High Power</span>
                      <span hlmBadge variant="secondary">Field Combat</span>
                      <span hlmBadge variant="secondary">{{ hero.clearanceTier }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Missions Tab -->
            @if (vm.activeTab() === 'missions') {
              <div hlmTabsContent value="missions" class="mt-6">
                <div hlmCard class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-foreground">
                    Deployment History
                  </h3>
                  <div class="space-y-3">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                      <div class="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p class="text-sm font-medium text-foreground">
                            Mission {{ hero.missionCount - i + 1 }}
                          </p>
                          <p class="text-xs text-muted-foreground">
                            Classified deployment
                          </p>
                        </div>
                        @if (i % 3 === 1) {
                          <span hlmBadge class="bg-success/20 text-success">Success</span>
                        } @else if (i % 3 === 2) {
                          <span hlmBadge class="bg-warning/20 text-warning">Injured</span>
                        } @else {
                          <span hlmBadge class="bg-destructive/20 text-destructive">
                            Aborted
                          </span>
                        }
                      </div>
                    }
                  </div>
                  <div class="mt-4 text-xs text-muted-foreground">
                    Total deployments: {{ hero.missionCount }}
                  </div>
                </div>
              </div>
            }

            <!-- Edit Tab -->
            @if (vm.activeTab() === 'edit') {
              <div hlmTabsContent value="edit" class="mt-6">
                <div hlmCard class="p-6">
                  <h3 class="mb-6 text-lg font-semibold text-foreground">Edit Hero</h3>
                  <form class="space-y-6">
                    <!-- Name -->
                    <div class="space-y-2">
                      <label hlmLabel for="name" class="text-sm font-medium">
                        Name
                      </label>
                      <input
                        hlmInput
                        id="name"
                        type="text"
                        placeholder="Hero name"
                        [(ngModel)]="editFormName"
                        (ngModelChange)="vm.updateEditForm({ name: $event })"
                        name="name"
                      />
                    </div>

                    <!-- Alias -->
                    <div class="space-y-2">
                      <label hlmLabel for="alias" class="text-sm font-medium">
                        Alias
                      </label>
                      <input
                        hlmInput
                        id="alias"
                        type="text"
                        placeholder="Operating alias"
                        [(ngModel)]="editFormAlias"
                        (ngModelChange)="vm.updateEditForm({ alias: $event })"
                        name="alias"
                      />
                    </div>

                    <!-- Power Class -->
                    <div class="space-y-2">
                      <label hlmLabel for="powerClass" class="text-sm font-medium">
                        Power Class
                      </label>
                      <select
                        hlmInput
                        id="powerClass"
                        [(ngModel)]="editFormPowerClass"
                        (ngModelChange)="vm.updateEditForm({ powerClass: $event })"
                        name="powerClass"
                      >
                        <option value="Aerial">Aerial</option>
                        <option value="Energy">Energy</option>
                        <option value="Psionic">Psionic</option>
                        <option value="Tech">Tech</option>
                        <option value="Mutant">Mutant</option>
                        <option value="Cosmic">Cosmic</option>
                        <option value="Enhanced">Enhanced</option>
                      </select>
                    </div>

                    <!-- Power Index -->
                    <div class="space-y-2">
                      <label hlmLabel for="powerIndex" class="text-sm font-medium">
                        Power Index
                      </label>
                      <input
                        hlmInput
                        id="powerIndex"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        [(ngModel)]="editFormPowerIndex"
                        (ngModelChange)="vm.updateEditForm({ powerIndex: $event })"
                        name="powerIndex"
                      />
                    </div>

                    <!-- Status -->
                    <div class="space-y-2">
                      <label hlmLabel for="status" class="text-sm font-medium">
                        Status
                      </label>
                      <select
                        hlmInput
                        id="status"
                        [(ngModel)]="editFormStatus"
                        (ngModelChange)="vm.updateEditForm({ status: $event })"
                        name="status"
                      >
                        <option value="Active">Active</option>
                        <option value="Injured">Injured</option>
                        <option value="Reserve">Reserve</option>
                        <option value="MIA">MIA</option>
                      </select>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex gap-3 pt-6">
                      <button
                        hlmBtn
                        type="button"
                        variant="default"
                        (click)="vm.saveHero()"
                        class="flex-1"
                      >
                        Save
                      </button>
                      <button
                        hlmBtn
                        type="button"
                        variant="outline"
                        (click)="vm.cancelEdit()"
                        class="flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            }
          </hlm-tabs>
        </div>

        <!-- Retire Confirmation Dialog -->
        @if (vm.showRetireDialog()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div hlmCard class="w-full max-w-md p-6 shadow-lg">
              <h2 class="mb-2 text-lg font-semibold text-foreground">Retire Hero</h2>
              <p class="mb-6 text-sm text-muted-foreground">
                Are you sure you want to retire {{ hero.name }}? This action cannot be
                undone.
              </p>
              <div class="flex gap-3">
                <button
                  hlmBtn
                  variant="outline"
                  (click)="vm.closeRetireDialog()"
                  class="flex-1"
                >
                  Cancel
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  (click)="vm.confirmRetire()"
                  class="flex-1"
                >
                  Retire
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="flex-1 flex items-center justify-center">
          <p class="text-muted-foreground">Hero not found</p>
        </div>
      }
    </div>
  `,
})
export class HeroDetail {
  vm = inject(HeroDetailViewModel);
  private route = inject(ActivatedRoute);

  // Edit form bindings
  editFormName = signal<string>('');
  editFormAlias = signal<string>('');
  editFormPowerClass = signal<string>('');
  editFormPowerIndex = signal<number>(0);
  editFormStatus = signal<string>('');

  constructor() {
    // Load hero from route param
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.vm.setHeroId(id);
        const hero = this.vm.hero();
        if (hero) {
          this.editFormName.set(hero.name);
          this.editFormAlias.set(hero.alias);
          this.editFormPowerClass.set(hero.powerClass);
          this.editFormPowerIndex.set(hero.powerIndex);
          this.editFormStatus.set(hero.status);
        }
      }
    });
  }

  getStatusStyle(status: string): { [key: string]: string } {
    const styles: { [key: string]: { color: string; bg: string } } = {
      Active: { color: 'var(--success)', bg: 'rgba(47, 181, 116, 0.1)' },
      Injured: { color: 'var(--warning)', bg: 'rgba(228, 128, 43, 0.1)' },
      Reserve: { color: 'var(--muted-foreground)', bg: 'rgba(91, 96, 114, 0.1)' },
      MIA: { color: 'var(--destructive)', bg: 'rgba(229, 72, 77, 0.1)' },
    };
    const style = styles[status] || { color: 'var(--foreground)', bg: 'transparent' };
    return { color: style.color, backgroundColor: style.bg };
  }
}
