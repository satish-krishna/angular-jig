import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucidePencil,
  lucideMoon,
  lucideSun,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HeroDetailViewModel } from './hero-detail.viewmodel';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgIconsModule,
    HlmButtonImports,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmInputImports,
    HlmSelectImports,
    HlmDialogImports,
    HlmTooltipImports,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideChevronLeft,
      lucideCrosshair,
      lucideTrash2,
      lucidePencil,
      lucideMoon,
      lucideSun,
    }),
  ],
  template: `
    <div class="flex-1 flex flex-col overflow-auto bg-background">
      @if (vm.hero(); as hero) {
        <!-- Back Link -->
        <div class="px-6 py-4 border-b border-border bg-background">
          <a
            routerLink="/roster"
            class="inline-flex items-center gap-1 text-sm text-primary hover:opacity-80"
          >
            <ng-icon name="lucideChevronLeft" class="w-4 h-4" />
            <span>Back to roster</span>
          </a>
        </div>

        <!-- Hero Detail Header -->
        <div class="px-6 py-6 border-b border-border bg-background">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div class="flex items-start gap-4">
              <hlm-avatar class="h-16 w-16 flex-shrink-0">
                <span hlmAvatarFallback class="text-lg">
                  {{ hero.name.substring(0, 2).toUpperCase() }}
                </span>
              </hlm-avatar>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold text-foreground">{{ hero.name }}</h1>
                <p class="text-sm text-muted-foreground mb-1">{{ hero.id }}</p>
                <p class="text-sm text-muted-foreground mb-3">{{ hero.alias }}</p>
                <div class="flex flex-wrap gap-2">
                  <span hlmBadge variant="secondary" class="inline-block">
                    {{ hero.powerClass }}
                  </span>
                  <span
                    hlmBadge
                    [ngStyle]="getStatusStyle(hero.status)"
                    class="inline-block font-medium"
                  >
                    {{ hero.status }}
                  </span>
                  <span hlmBadge variant="secondary" class="inline-block">
                    {{ hero.clearanceTier }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 sm:flex-col sm:flex-nowrap">
              <button
                hlmBtn
                variant="default"
                class="flex items-center gap-2"
                [hlmTooltip]="'Deploy hero'"
              >
                <ng-icon name="lucideCrosshair" class="w-4 h-4" />
                <span>Deploy</span>
              </button>
              <button
                hlmBtn
                variant="destructive"
                class="flex items-center gap-2"
                (click)="showRetireConfirm()"
                [hlmTooltip]="'Retire hero'"
              >
                <ng-icon name="lucideTrash2" class="w-4 h-4" />
                <span>Retire</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex-1 overflow-auto">
          <div class="px-6">
            <!-- Tab Buttons -->
            <div class="flex gap-1 border-b border-border mt-6 mb-0">
              <button
                (click)="activeTab.set('overview')"
                [class]="activeTab() === 'overview'
                  ? 'px-4 py-3 font-medium text-foreground border-b-2 border-primary -mb-px'
                  : 'px-4 py-3 font-medium text-muted-foreground hover:text-foreground'"
              >
                Overview
              </button>
              <button
                (click)="activeTab.set('powers')"
                [class]="activeTab() === 'powers'
                  ? 'px-4 py-3 font-medium text-foreground border-b-2 border-primary -mb-px'
                  : 'px-4 py-3 font-medium text-muted-foreground hover:text-foreground'"
              >
                Powers
              </button>
              <button
                (click)="activeTab.set('missions')"
                [class]="activeTab() === 'missions'
                  ? 'px-4 py-3 font-medium text-foreground border-b-2 border-primary -mb-px'
                  : 'px-4 py-3 font-medium text-muted-foreground hover:text-foreground'"
              >
                Missions
              </button>
              <button
                (click)="activeTab.set('edit')"
                [class]="activeTab() === 'edit'
                  ? 'px-4 py-3 font-medium text-foreground border-b-2 border-primary -mb-px'
                  : 'px-4 py-3 font-medium text-muted-foreground hover:text-foreground'"
              >
                Edit
              </button>
            </div>

            <!-- Overview Tab -->
            @if (activeTab() === 'overview') {
            <div class="pb-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  <!-- Field Summary -->
                  <div class="lg:col-span-2">
                    <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
                      <h3 class="text-sm font-semibold text-foreground mb-4">Field Summary</h3>
                      <p class="text-sm text-muted-foreground leading-relaxed">
                        {{ hero.bio || 'No field notes available.' }}
                      </p>
                    </div>

                    <!-- Mini Stats -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div class="bg-card border border-border rounded-lg p-4">
                        <div class="text-xs font-medium text-muted-foreground mb-1">
                          Missions
                        </div>
                        <div class="text-2xl font-bold text-foreground">
                          {{ hero.missionCount }}
                        </div>
                      </div>
                      <div class="bg-card border border-border rounded-lg p-4">
                        <div class="text-xs font-medium text-muted-foreground mb-1">
                          Success Rate
                        </div>
                        <div class="text-2xl font-bold text-foreground">
                          {{ hero.successRate }}%
                        </div>
                      </div>
                      <div class="bg-card border border-border rounded-lg p-4">
                        <div class="text-xs font-medium text-muted-foreground mb-1">
                          Power Index
                        </div>
                        <div class="text-2xl font-bold text-foreground">
                          {{ hero.powerIndex }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Dossier (Key/Value) -->
                  <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <h3 class="text-sm font-semibold text-foreground mb-4">Dossier</h3>
                    <div class="space-y-3 text-sm">
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Status</span>
                        <span class="font-medium text-foreground">{{ hero.status }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Class</span>
                        <span class="font-medium text-foreground">{{ hero.powerClass }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Clearance</span>
                        <span class="font-medium text-foreground">{{ hero.clearanceTier }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Power</span>
                        <span class="font-medium text-foreground">{{ hero.powerIndex }}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            }

            <!-- Powers Tab -->
            @if (activeTab() === 'powers') {
            <div class="pb-8">
              <div class="mt-4">
                  <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <h3 class="text-sm font-semibold text-foreground mb-4">
                      Power Index: {{ hero.powerIndex }}/100
                    </h3>
                    <!-- Power Meter -->
                    <div class="mb-4">
                      <div class="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary rounded-full transition-all"
                          [style.width.%]="hero.powerIndex"
                        ></div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div
                        class="px-3 py-2 bg-muted rounded text-sm font-medium text-foreground"
                      >
                        <span>{{ hero.powerClass }}</span>
                      </div>
                      <div class="px-3 py-2 bg-muted rounded text-sm font-medium text-foreground">
                        <span>Tier {{ hero.clearanceTier.split(' ')[1] }} Capability</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            }

            <!-- Missions Tab -->
            @if (activeTab() === 'missions') {
            <div class="pb-8">
              <div class="mt-4">
                <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <h3 class="text-sm font-semibold text-foreground mb-4">
                      Deployment Record
                    </h3>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                          <div class="text-sm font-medium text-foreground">
                            Total Deployments
                          </div>
                          <div class="text-xs text-muted-foreground">
                            Career missions
                          </div>
                        </div>
                        <div class="text-2xl font-bold text-foreground">
                          {{ hero.missionCount }}
                        </div>
                      </div>
                      <div class="flex items-center justify-between pt-2">
                        <div>
                          <div class="text-sm font-medium text-foreground">
                            Success Rate
                          </div>
                          <div class="text-xs text-muted-foreground">
                            Successful outcomes
                          </div>
                        </div>
                        <div
                          class="px-3 py-2 bg-muted rounded font-medium text-foreground"
                        >
                          {{ hero.successRate }}%
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            }

            <!-- Edit Tab -->
            @if (activeTab() === 'edit') {
            <div class="pb-8">
              <div class="mt-4">
                  @if (!vm.isEditing()) {
                    <div class="text-center py-12">
                      <button
                        hlmBtn
                        variant="default"
                        class="flex items-center gap-2 mx-auto"
                        (click)="vm.startEditing()"
                      >
                        <ng-icon name="lucidePencil" class="w-4 h-4" />
                        <span>Edit Hero</span>
                      </button>
                    </div>
                  } @else {
                    <div class="bg-card border border-border rounded-lg p-6 shadow-sm max-w-2xl">
                      <h3 class="text-lg font-semibold text-foreground mb-6">Edit Hero</h3>
                      <form (ngSubmit)="onSubmit()" class="space-y-6">
                        <!-- Name Field -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Codename
                          </label>
                          <input
                            hlmInput
                            type="text"
                            placeholder="Hero name"
                            [value]="vm.getFormValue('name') || ''"
                            (input)="onNameChange($event)"
                            class="w-full"
                          />
                          @if (vm.formErrors()['name']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['name'] }}
                            </span>
                          }
                        </div>

                        <!-- Alias Field -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Alter ego
                          </label>
                          <input
                            hlmInput
                            type="text"
                            placeholder="Real name or alias"
                            [value]="vm.getFormValue('alias') || ''"
                            (input)="onAliasChange($event)"
                            class="w-full"
                          />
                          @if (vm.formErrors()['alias']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['alias'] }}
                            </span>
                          }
                        </div>

                        <!-- Power Class Select -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Power class
                          </label>
                          <select
                            hlmInput
                            [value]="vm.getFormValue('powerClass') || ''"
                            (change)="onPowerClassChange($event)"
                            class="w-full"
                          >
                            <option value="">Select a power class</option>
                            <option value="Aerial">Aerial</option>
                            <option value="Energy">Energy</option>
                            <option value="Psionic">Psionic</option>
                            <option value="Tech">Tech</option>
                            <option value="Mutant">Mutant</option>
                            <option value="Cosmic">Cosmic</option>
                            <option value="Enhanced">Enhanced</option>
                          </select>
                          @if (vm.formErrors()['powerClass']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['powerClass'] }}
                            </span>
                          }
                        </div>

                        <!-- Power Index Field -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Power index (0-100)
                          </label>
                          <input
                            hlmInput
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            [value]="vm.getFormValue('powerIndex') || ''"
                            (input)="onPowerIndexChange($event)"
                            class="w-full"
                          />
                          @if (vm.formErrors()['powerIndex']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['powerIndex'] }}
                            </span>
                          }
                        </div>

                        <!-- Bio/Notes Textarea -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Field notes
                          </label>
                          <textarea
                            hlmInput
                            placeholder="Field observations and notes"
                            [value]="vm.getFormValue('bio') || ''"
                            (input)="onBioChange($event)"
                            class="w-full min-h-24 resize-vertical"
                          ></textarea>
                          @if (vm.formErrors()['bio']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['bio'] }}
                            </span>
                          }
                        </div>

                        <!-- Status Select -->
                        <div class="flex flex-col gap-2">
                          <label class="text-sm font-medium text-foreground">
                            Status
                          </label>
                          <select
                            hlmInput
                            [value]="vm.getFormValue('status') || ''"
                            (change)="onStatusChange($event)"
                            class="w-full"
                          >
                            <option value="">Select a status</option>
                            <option value="Active">Active</option>
                            <option value="Injured">Injured</option>
                            <option value="Reserve">Reserve</option>
                            <option value="MIA">MIA</option>
                          </select>
                          @if (vm.formErrors()['status']) {
                            <span class="text-xs text-destructive">
                              {{ vm.formErrors()['status'] }}
                            </span>
                          }
                        </div>

                        <!-- Form Actions -->
                        <div class="flex gap-3 pt-6 border-t border-border">
                          <button
                            hlmBtn
                            type="submit"
                            variant="default"
                            [disabled]="vm.isSubmitting()"
                            class="flex-1"
                          >
                            @if (vm.isSubmitting()) {
                              <span>Saving...</span>
                            } @else {
                              <span>Save</span>
                            }
                          </button>
                          <button
                            hlmBtn
                            type="button"
                            variant="outline"
                            (click)="vm.cancelEditing()"
                            [disabled]="vm.isSubmitting()"
                            class="flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>

                      <!-- Retire Button -->
                      <div class="mt-6 pt-6 border-t border-border">
                        <button
                          hlmBtn
                          variant="destructive"
                          class="w-full"
                          (click)="showRetireConfirm()"
                        >
                          <ng-icon name="lucideTrash2" class="w-4 h-4" />
                          <span>Retire Hero</span>
                        </button>
                      </div>
                    </div>
                  }
              </div>
            </div>
            }
          </div>
        </div>

        <!-- Retire Confirmation Dialog -->
        @if (showRetireDialog()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div class="bg-card border border-border rounded-lg p-6 shadow-lg max-w-sm w-full">
              <h2 class="text-lg font-semibold text-foreground mb-2">Retire Hero?</h2>
              <p class="text-sm text-muted-foreground mb-6">
                Are you sure you want to retire {{ hero.name }}? This action cannot be undone.
              </p>
              <div class="flex gap-3">
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  (click)="closeRetireDialog()"
                  class="flex-1"
                >
                  Cancel
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="destructive"
                  (click)="confirmRetire()"
                  class="flex-1"
                >
                  Retire
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Hero not found</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      textarea {
        font-family: inherit;
      }
    `,
  ],
})
export class HeroDetail {
  vm = inject(HeroDetailViewModel);

  activeTab = signal('overview');
  showRetireDialog = signal(false);

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

  showRetireConfirm(): void {
    this.showRetireDialog.set(true);
  }

  closeRetireDialog(): void {
    this.showRetireDialog.set(false);
  }

  confirmRetire(): void {
    this.showRetireDialog.set(false);
    this.vm.retire();
  }

  onSubmit(): void {
    this.vm.saveForm();
  }

  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vm.setFormValue('name', target.value);
  }

  onAliasChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vm.setFormValue('alias', target.value);
  }

  onPowerClassChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as any;
    this.vm.setFormValue('powerClass', value);
  }

  onPowerIndexChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    this.vm.setFormValue('powerIndex', value);
  }

  onBioChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.vm.setFormValue('bio', target.value);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as any;
    this.vm.setFormValue('status', value);
  }
}
