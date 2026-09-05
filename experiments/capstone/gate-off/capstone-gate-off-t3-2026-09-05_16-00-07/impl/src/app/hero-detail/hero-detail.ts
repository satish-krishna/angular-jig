import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucideZap,
  lucideCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import {
  HlmTabs,
  HlmTabsContent,
  HlmTabsList,
  HlmTabsTrigger,
} from '@spartan-ng/helm/tabs';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { NgIcon } from '@ng-icons/core';
import { HeroDetailViewModel } from './hero-detail.viewmodel';
import { HeroEditForm } from '../ui/hero-edit-form';
import { PowerMeter } from '../ui/power-meter';
import type { HeroStatus } from '../domain/hero.model';

@Component({
  selector: 'app-hero-detail',
  imports: [
    CommonModule,
    RouterLink,
    HlmButton,
    HlmBadge,
    HlmAvatarFallback,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    NgIcon,
    HeroEditForm,
    PowerMeter,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideChevronLeft,
      lucideCrosshair,
      lucideTrash2,
      lucideZap,
      lucideCheck,
      lucideTriangleAlert,
    }),
  ],
  template: `
    <div class="flex flex-col gap-6 p-6">
      @if (vm.hero(); as hero) {
        <!-- Back Link -->
        <button
          hlmBtn
          variant="ghost"
          routerLink="/roster"
          class="w-fit text-sm text-muted-foreground hover:text-foreground"
        >
          <ng-icon name="lucideChevronLeft" class="mr-1 size-4" />
          Back to roster
        </button>

        <!-- Detail Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex gap-4">
            <div hlmAvatar class="size-16">
              <div hlmAvatarFallback class="bg-primary text-primary-foreground text-lg font-bold">
                {{ hero.name.substring(0, 2).toUpperCase() }}
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="text-2xl font-bold text-foreground">{{ hero.name }}</div>
              <div class="text-sm text-muted-foreground">{{ hero.alias }}</div>
              <div class="flex flex-wrap gap-2">
                <div hlmBadge variant="outline" class="text-xs">{{ hero.powerClass }}</div>
                <div hlmBadge [variant]="statusVariant(hero.status)" class="text-xs" [class]="statusSemanticClass(hero.status)">
                  {{ hero.status }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              hlmBtn
              variant="default"
              class="flex items-center gap-2"
            >
              <ng-icon name="lucideCrosshair" class="size-4" />
              <span>Deploy</span>
            </button>
            <button
              hlmBtn
              variant="destructive"
              (click)="vm.openRetireDialog()"
              class="flex items-center gap-2"
            >
              <ng-icon name="lucideTrash2" class="size-4" />
              <span>Retire</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="space-y-4">
          <div class="grid w-full grid-cols-4 border-b border-border">
            <button
              hlmBtn
              variant="ghost"
              (click)="vm.setActiveTab('overview')"
              [class]="vm.activeTab() === 'overview' ? 'border-b-2 border-primary' : ''"
              class="rounded-none hover:bg-muted"
            >
              Overview
            </button>
            <button
              hlmBtn
              variant="ghost"
              (click)="vm.setActiveTab('powers')"
              [class]="vm.activeTab() === 'powers' ? 'border-b-2 border-primary' : ''"
              class="rounded-none hover:bg-muted"
            >
              Powers
            </button>
            <button
              hlmBtn
              variant="ghost"
              (click)="vm.setActiveTab('missions')"
              [class]="vm.activeTab() === 'missions' ? 'border-b-2 border-primary' : ''"
              class="rounded-none hover:bg-muted"
            >
              Missions
            </button>
            <button
              hlmBtn
              variant="ghost"
              (click)="vm.setActiveTab('edit')"
              [class]="vm.activeTab() === 'edit' ? 'border-b-2 border-primary' : ''"
              class="rounded-none hover:bg-muted"
            >
              Edit
            </button>
          </div>

          <!-- Overview Tab -->
          @if (vm.activeTab() === 'overview') {
          <div class="space-y-6">
            <div class="grid gap-6 sm:grid-cols-2">
              <!-- Field Summary -->
              <div hlmCard>
                <div hlmCardHeader>
                  <div hlmCardTitle class="text-lg font-semibold">Field Summary</div>
                </div>
                <div hlmCardContent class="space-y-4">
                  <app-power-meter
                    [label]="'Power Index'"
                    [value]="hero.powerIndex"
                  />
                  <div class="flex items-center justify-between border-t border-border pt-4">
                    <span class="text-sm font-medium text-foreground">Clearance</span>
                    <span class="text-sm font-bold text-primary">{{ hero.clearanceTier }}</span>
                  </div>
                </div>
              </div>

              <!-- Dossier -->
              <div hlmCard>
                <div hlmCardHeader>
                  <div hlmCardTitle class="text-lg font-semibold">Dossier</div>
                </div>
                <div hlmCardContent class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Missions</span>
                    <span class="text-sm font-bold text-foreground">{{ hero.missionCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Success Rate</span>
                    <span class="text-sm font-bold text-success">{{ (hero.successRate * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Status</span>
                    <span class="text-sm font-bold text-foreground">{{ hero.status }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mini Stats -->
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div hlmCard>
                <div hlmCardContent class="flex items-center gap-3 p-4">
                  <ng-icon name="lucideZap" class="size-5 text-primary" />
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Power</span>
                    <span class="text-lg font-bold text-foreground">{{ hero.powerIndex }}</span>
                  </div>
                </div>
              </div>
              <div hlmCard>
                <div hlmCardContent class="flex items-center gap-3 p-4">
                  <ng-icon name="lucideCheck" class="size-5 text-success" />
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Success</span>
                    <span class="text-lg font-bold text-foreground">{{ (hero.successRate * 100).toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
              <div hlmCard>
                <div hlmCardContent class="flex items-center gap-3 p-4">
                  <ng-icon name="lucideTriangleAlert" class="size-5 text-warning" />
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Tier</span>
                    <span class="text-lg font-bold text-foreground">{{ hero.clearanceTier }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          }

          <!-- Powers Tab -->
          @if (vm.activeTab() === 'powers') {
          <div class="space-y-6">
            <div hlmCard>
              <div hlmCardHeader>
                <div hlmCardTitle class="text-lg font-semibold">Power Capabilities</div>
              </div>
              <div hlmCardContent class="space-y-6 p-6">
                <app-power-meter
                  [label]="'Overall Power Index'"
                  [value]="hero.powerIndex"
                />
                <div class="space-y-2">
                  <div class="text-sm font-medium text-foreground">Class: {{ hero.powerClass }}</div>
                  <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                </div>
              </div>
            </div>
          </div>
          }

          <!-- Missions Tab -->
          @if (vm.activeTab() === 'missions') {
          <div class="space-y-6">
            <div hlmCard>
              <div hlmCardHeader>
                <div hlmCardTitle class="text-lg font-semibold">Mission History</div>
              </div>
              <div hlmCardContent class="p-6">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-foreground">Total Deployments</span>
                    <span class="text-sm font-bold text-foreground">{{ hero.missionCount }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-foreground">Success Rate</span>
                    <span class="text-sm font-bold text-success">{{ (hero.successRate * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-foreground">Failed Missions</span>
                    <span class="text-sm font-bold text-destructive">{{ Math.ceil(hero.missionCount * (1 - hero.successRate)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          }

          <!-- Edit Tab -->
          @if (vm.activeTab() === 'edit') {
          <div class="space-y-6">
            @if (vm.formData(); as formData) {
              <div hlmCard>
                <div hlmCardContent class="p-6">
                  <app-hero-edit-form
                    [data]="formData"
                    [errors]="vm.validationErrors()"
                    (fieldChanged)="onFormFieldChange($event)"
                    (submitted)="vm.saveHero()"
                    (canceled)="vm.cancelEdit()"
                  />
                </div>
              </div>
            }
          </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center gap-4 py-12">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-foreground">Hero not found</h2>
            <p class="text-sm text-muted-foreground">The hero you're looking for doesn't exist.</p>
          </div>
          <button hlmBtn variant="default" routerLink="/roster">
            Back to Roster
          </button>
        </div>
      }

      <!-- Retire Confirmation Dialog -->
      @if (vm.showRetireDialog()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div hlmCard class="w-full max-w-sm bg-card">
            <div hlmCardHeader>
              <div hlmCardTitle class="text-lg font-semibold text-foreground">
                Retire {{ vm.hero()?.name }}?
              </div>
            </div>
            <div hlmCardContent class="space-y-4 p-6">
              <p class="text-sm text-muted-foreground">
                This action cannot be undone. The hero will be permanently removed from the roster.
              </p>
              <div class="flex gap-3">
                <button
                  hlmBtn
                  variant="destructive"
                  (click)="vm.confirmRetire()"
                  class="flex-1"
                >
                  Retire
                </button>
                <button
                  hlmBtn
                  variant="outline"
                  (click)="vm.closeRetireDialog()"
                  class="flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  readonly vm = inject(HeroDetailViewModel);
  readonly Math = Math;

  statusVariant(status: HeroStatus): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
      case 'MIA':
        return 'outline';
    }
  }

  statusSemanticClass(status: HeroStatus): string {
    switch (status) {
      case 'Active':
        return 'bg-success text-white';
      case 'Injured':
        return 'bg-warning text-white';
      case 'MIA':
      case 'Reserve':
        return 'bg-destructive text-white';
    }
  }

  onFormFieldChange(event: { fieldName: string; value: unknown }): void {
    this.vm.updateFormField(event.fieldName, event.value);
  }
}
