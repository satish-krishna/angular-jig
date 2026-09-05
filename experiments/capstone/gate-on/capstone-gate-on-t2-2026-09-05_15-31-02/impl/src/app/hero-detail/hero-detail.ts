import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  template: `
    <div class="flex flex-col gap-6 p-6 min-h-screen">
      @if (vm.currentHero(); as hero) {
        <!-- Back link -->
        <div>
          <button hlmBtn variant="ghost" (click)="goBack()" class="flex items-center gap-2">
            <ng-icon name="lucideChevronLeft" />
            <span>Back to roster</span>
          </button>
        </div>

        <!-- Detail header -->
        <div class="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
          <div class="flex items-start gap-4">
            <div hlmAvatar class="w-16 h-16">
              {{ getInitials(hero.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-muted-foreground">{{ hero.id }}</div>
              <h1 class="text-2xl font-bold">{{ hero.name }}</h1>
              <div class="text-lg text-muted-foreground">{{ hero.alias }}</div>
              <div class="flex gap-2 mt-2 flex-wrap">
                <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                <div hlmBadge [variant]="getStatusVariant(hero.status)">
                  {{ hero.status }}
                </div>
                <div hlmBadge variant="secondary">{{ hero.clearanceTier }}</div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2 flex-wrap sm:flex-nowrap">
            <button hlmBtn variant="default" [attr.aria-label]="'Deploy ' + hero.name">
              <ng-icon name="lucideCrosshair" />
              <span>Deploy</span>
            </button>
            <button hlmBtn variant="destructive" (click)="vm.openRetireDialog()" [attr.aria-label]="'Retire ' + hero.name">
              <ng-icon name="lucideTrash2" />
              <span>Retire</span>
            </button>
          </div>
        </div>

        <!-- Tabs navigation -->
        <div class="flex gap-2 border-b border-border flex-wrap">
          <button hlmBtn variant="ghost" (click)="vm.setActiveTab('overview')" [class.font-bold]="vm.activeTab() === 'overview'">
            Overview
          </button>
          <button hlmBtn variant="ghost" (click)="vm.setActiveTab('powers')" [class.font-bold]="vm.activeTab() === 'powers'">
            Powers
          </button>
          <button hlmBtn variant="ghost" (click)="vm.setActiveTab('missions')" [class.font-bold]="vm.activeTab() === 'missions'">
            Missions
          </button>
          <button hlmBtn variant="ghost" (click)="vm.setActiveTab('edit')" [class.font-bold]="vm.activeTab() === 'edit'">
            Edit
          </button>
        </div>

        <!-- Overview tab -->
        @if (vm.activeTab() === 'overview') {
          <div class="flex flex-col gap-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-card border border-border rounded-lg p-4">
                <div class="text-sm text-muted-foreground">Power Index</div>
                <div class="text-2xl font-bold">{{ hero.powerIndex }}</div>
              </div>
              <div class="bg-card border border-border rounded-lg p-4">
                <div class="text-sm text-muted-foreground">Missions Completed</div>
                <div class="text-2xl font-bold">{{ hero.missionCount }}</div>
              </div>
              <div class="bg-card border border-border rounded-lg p-4">
                <div class="text-sm text-muted-foreground">Success Rate</div>
                <div class="text-2xl font-bold">{{ hero.successRate }}%</div>
              </div>
            </div>

            <div class="bg-card border border-border rounded-lg p-6">
              <h3 class="font-semibold mb-4">Dossier</h3>
              <div class="flex flex-col gap-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Power Class</span>
                  <span>{{ hero.powerClass }}</span>
                </div>
                <div class="border-t border-border"></div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Status</span>
                  <span>{{ hero.status }}</span>
                </div>
                <div class="border-t border-border"></div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Clearance Tier</span>
                  <span>{{ hero.clearanceTier }}</span>
                </div>
                <div class="border-t border-border"></div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Deployment Count</span>
                  <span>{{ hero.missionCount }}</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Powers tab -->
        @if (vm.activeTab() === 'powers') {
          <div class="flex flex-col gap-6">
            <div class="bg-card border border-border rounded-lg p-6">
              <h3 class="font-semibold mb-4">Power Meter</h3>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center mb-2">
                  <span>{{ hero.powerClass }} Power</span>
                  <span class="font-semibold">{{ hero.powerIndex }}/100</span>
                </div>
                <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full transition-all"
                    [style.width.%]="hero.powerIndex"
                  ></div>
                </div>
              </div>
            </div>

            <div class="bg-card border border-border rounded-lg p-6">
              <h3 class="font-semibold mb-4">Ability Badges</h3>
              <div class="flex gap-2 flex-wrap">
                <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                <div hlmBadge [variant]="getStatusVariant(hero.status)">
                  {{ hero.status }}
                </div>
                <div hlmBadge variant="secondary">{{ hero.clearanceTier }}</div>
              </div>
            </div>
          </div>
        }

        <!-- Missions tab -->
        @if (vm.activeTab() === 'missions') {
          <div class="flex flex-col gap-4">
            <div class="bg-card border border-border rounded-lg p-6">
              <h3 class="font-semibold mb-4">Deployment History</h3>
              <div class="flex flex-col gap-4">
                @for (i of [1, 2, 3]; track i) {
                  <div class="flex justify-between items-center pb-4 border-b border-border last:border-b-0">
                    <div>
                      <div class="font-medium">Operation {{ hero.name | uppercase }}</div>
                      <div class="text-sm text-muted-foreground">{{ i }} month{{ i > 1 ? 's' : '' }} ago</div>
                    </div>
                    <div hlmBadge variant="default">
                      <ng-icon name="lucideCheck" class="mr-1" />
                      Success
                    </div>
                  </div>
                }
              </div>
              <div class="mt-4 text-center text-muted-foreground">
                Total: {{ hero.missionCount }} missions, {{ hero.successRate }}% success rate
              </div>
            </div>
          </div>
        }

        <!-- Edit tab -->
        @if (vm.activeTab() === 'edit') {
          <div class="flex flex-col gap-6">
            @if (!vm.isEditing()) {
              <div class="bg-card border border-border rounded-lg p-6">
                <p class="text-muted-foreground mb-4">Ready to update hero information?</p>
                <button hlmBtn (click)="vm.startEdit()">
                  <ng-icon name="lucidePencil" />
                  <span>Edit Hero</span>
                </button>
              </div>
            } @else {
              <form (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <!-- Name field -->
                  <div class="flex flex-col gap-2">
                    <label hlmLabel for="name">Name</label>
                    <input
                      hlmInput
                      id="name"
                      type="text"
                      placeholder="Enter hero name"
                      [value]="vm.formName()"
                      (input)="vm.formName.set($any($event.target).value)"
                    />
                  </div>

                  <!-- Alias field -->
                  <div class="flex flex-col gap-2">
                    <label hlmLabel for="alias">Alias</label>
                    <input
                      hlmInput
                      id="alias"
                      type="text"
                      placeholder="Enter hero alias"
                      [value]="vm.formAlias()"
                      (input)="vm.formAlias.set($any($event.target).value)"
                    />
                  </div>

                  <!-- Power Class field -->
                  <div class="flex flex-col gap-2">
                    <label hlmLabel for="powerClass">Power Class</label>
                    <hlm-select [value]="vm.formPowerClass()" (change)="vm.formPowerClass.set($any($event))">
                      <hlm-select-trigger id="powerClass">
                        <hlm-select-value />
                      </hlm-select-trigger>
                      <hlm-select-content>
                        @for (cls of ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced']; track cls) {
                          <hlm-select-item [value]="cls">{{ cls }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </div>

                  <!-- Power Index field -->
                  <div class="flex flex-col gap-2">
                    <label hlmLabel for="powerIndex">Power Index (0-100)</label>
                    <input
                      hlmInput
                      id="powerIndex"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      [value]="vm.formPowerIndex()"
                      (input)="vm.formPowerIndex.set($any($event.target).valueAsNumber)"
                    />
                  </div>
                </div>

                <!-- Notes field (full width) -->
                <div class="flex flex-col gap-2">
                  <label hlmLabel for="notes">Notes</label>
                  <textarea
                    hlmTextarea
                    id="notes"
                    placeholder="Add any notes about this hero"
                    [value]="vm.formNotes()"
                    (input)="vm.formNotes.set($any($event.target).value)"
                    rows="4"
                  ></textarea>
                </div>

                <!-- Active switch -->
                <div class="flex items-center gap-3">
                  <hlm-switch [checked]="vm.formIsActive()" (checkedChange)="vm.formIsActive.set($any($event))" id="isActive" />
                  <label hlmLabel for="isActive" class="mb-0">Active Status</label>
                </div>

                <!-- Form actions -->
                <div class="flex gap-2 flex-wrap pt-4">
                  <button hlmBtn type="submit" [disabled]="vm.isSaving()">
                    @if (vm.isSaving()) {
                      <span>Saving...</span>
                    } @else {
                      <span>Save Changes</span>
                    }
                  </button>
                  <button hlmBtn variant="outline" type="button" (click)="vm.cancelEdit()" [disabled]="vm.isSaving()">
                    Cancel
                  </button>
                </div>

                <!-- Retire option -->
                <div class="border-t border-border pt-6">
                  <p class="text-muted-foreground mb-4">
                    Retire this hero to mark them as MIA and remove from active duty.
                  </p>
                  <button hlmBtn variant="destructive" type="button" (click)="vm.openRetireDialog()">
                    <ng-icon name="lucideTrash2" />
                    <span>Retire Hero</span>
                  </button>
                </div>
              </form>
            }
          </div>
        }
      } @else {
        <div class="flex items-center justify-center h-96">
          <p class="text-muted-foreground">Hero not found</p>
        </div>
      }
    </div>

    <!-- Retire confirmation dialog -->
    @if (vm.showRetireDialog()) {
      <hlm-dialog>
        <hlm-dialog-content>
          <div class="flex flex-col gap-4">
            <div>
              <h2 class="font-semibold">Retire Hero?</h2>
              <p class="text-sm text-muted-foreground mt-2">
                This action cannot be undone. Are you sure you want to retire this hero?
              </p>
            </div>
            <div class="flex gap-3 justify-end">
              <button hlmBtn variant="outline" (click)="vm.closeRetireDialog()">Cancel</button>
              <button hlmBtn variant="destructive" (click)="vm.confirmRetire()">
                Retire Hero
              </button>
            </div>
          </div>
        </hlm-dialog-content>
      </hlm-dialog>
    }
  `,
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmButton,
    HlmBadge,
    HlmAvatarImports,
    HlmInput,
    HlmSelectImports,
    HlmSwitchImports,
    HlmLabel,
    HlmDialogImports,
    HlmTextarea,
  ],
  providers: [HeroDetailViewModel],
})
export class HeroDetail {
  readonly vm = inject(HeroDetailViewModel);
  readonly router = inject(Router);

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase();
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'MIA':
        return 'destructive';
      case 'Reserve':
        return 'outline';
      default:
        return 'default';
    }
  }

  goBack(): void {
    this.router.navigate(['/roster']);
  }

  onSubmit(): void {
    this.vm.saveHero();
  }
}
