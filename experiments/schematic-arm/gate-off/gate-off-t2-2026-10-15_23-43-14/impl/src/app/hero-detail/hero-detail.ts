import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCheck,
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { PowerMeter } from '../ui/power-meter';
import { StatTile } from '../ui/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

/**
 * Hero detail screen: the back link, the header with its deploy and retire actions, and four
 * tabs (Overview, Powers, Missions, Edit). Retiring goes through a confirmation dialog. A thin
 * shell over its ViewModel.
 */
@Component({
  selector: 'app-hero-detail',
  imports: [
    NgIcon,
    RouterLink,
    HlmAvatar,
    HlmAvatarFallback,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmTabsImports,
    FormField,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideChevronLeft, lucideCrosshair, lucideTrash2, lucideZap }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <a hlmBtn variant="ghost" routerLink="/roster" class="self-start">
        <ng-icon name="lucideChevronLeft" />
        Back to roster
      </a>

      @if (vm.hero(); as hero) {
        <header class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-4">
            <hlm-avatar size="lg">
              <span hlmAvatarFallback>{{ vm.initials() }}</span>
            </hlm-avatar>
            <div class="flex min-w-0 flex-col gap-1">
              <p class="text-xs text-muted-foreground">{{ hero.id }}</p>
              <h1 class="truncate text-2xl font-bold">{{ hero.name }}</h1>
              <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{{ hero.alias }}</span>
                <hlm-badge variant="outline">{{ hero.powerClass }}</hlm-badge>
                <hlm-badge [variant]="vm.statusVariant()">{{ hero.status }}</hlm-badge>
                <hlm-badge variant="secondary">{{ hero.clearance }}</hlm-badge>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button hlmBtn variant="outline" [disabled]="!vm.canDeploy()" (click)="vm.deploy()">
              <ng-icon name="lucideCrosshair" />
              Deploy
            </button>

            <hlm-dialog #retireDialog="hlmDialog">
              <button hlmDialogTrigger hlmBtn variant="destructive">
                <ng-icon name="lucideTrash2" />
                Retire
              </button>
              <hlm-dialog-content *hlmDialogPortal class="sm:max-w-sm">
                <hlm-dialog-header>
                  <h2 hlmDialogTitle>Retire {{ hero.name }}?</h2>
                  <p hlmDialogDescription>
                    {{ hero.name }} will be removed from the roster. This cannot be undone in this console.
                  </p>
                </hlm-dialog-header>
                <hlm-dialog-footer>
                  <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>
                  <button hlmBtn variant="destructive" (click)="retireDialog.close(); vm.retire()">Retire hero</button>
                </hlm-dialog-footer>
              </hlm-dialog-content>
            </hlm-dialog>
          </div>
        </header>

        @if (vm.notice(); as message) {
          <p role="status" class="text-sm text-muted-foreground">{{ message }}</p>
        }

        <div hlmTabs tab="overview" class="flex w-full flex-col gap-4">
          <div hlmTabsList aria-label="Hero sections" class="flex flex-wrap">
            <button hlmTabsTrigger="overview">Overview</button>
            <button hlmTabsTrigger="powers">Powers</button>
            <button hlmTabsTrigger="missions">Missions</button>
            <button hlmTabsTrigger="edit">Edit</button>
          </div>

          <div hlmTabsContent="overview" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <app-stat-tile label="Power index" [value]="hero.powerIndex" note="out of 100">
                <ng-icon name="lucideZap" />
              </app-stat-tile>
              <app-stat-tile label="Missions" [value]="hero.missionCount" note="logged to date">
                <ng-icon name="lucideActivity" />
              </app-stat-tile>
              <app-stat-tile label="Success rate" [value]="hero.successRate" note="percent of missions">
                <ng-icon name="lucideCheck" />
              </app-stat-tile>
            </div>

            <div hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>Dossier</h2>
              </div>
              <div hlmCardContent>
                <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div class="flex flex-col">
                    <dt class="text-xs text-muted-foreground">Hero ID</dt>
                    <dd class="font-medium">{{ hero.id }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-xs text-muted-foreground">Alias</dt>
                    <dd class="font-medium">{{ hero.alias }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-xs text-muted-foreground">Power class</dt>
                    <dd class="font-medium">{{ hero.powerClass }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-xs text-muted-foreground">Clearance</dt>
                    <dd class="font-medium">{{ hero.clearance }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-xs text-muted-foreground">Status</dt>
                    <dd class="font-medium">{{ hero.status }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div hlmTabsContent="powers" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>Power index</h2>
              </div>
              <div hlmCardContent>
                <app-power-meter [value]="hero.powerIndex" />
              </div>
            </div>
            <div hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>Classification</h2>
              </div>
              <div hlmCardContent class="flex flex-wrap gap-2">
                <hlm-badge variant="outline">{{ hero.powerClass }}</hlm-badge>
                <hlm-badge variant="secondary">{{ hero.clearance }}</hlm-badge>
              </div>
            </div>
          </div>

          <div hlmTabsContent="missions" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <app-stat-tile label="Missions" [value]="hero.missionCount" note="logged to date">
                <ng-icon name="lucideActivity" />
              </app-stat-tile>
              <div hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>Successful</h2>
                </div>
                <div hlmCardContent>
                  <hlm-badge variant="success">{{ vm.record().won }} won</hlm-badge>
                </div>
              </div>
              <div hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>Unsuccessful</h2>
                </div>
                <div hlmCardContent>
                  <hlm-badge variant="destructive">{{ vm.record().lost }} lost</hlm-badge>
                </div>
              </div>
            </div>
          </div>

          <div hlmTabsContent="edit">
            <div hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>Edit hero</h2>
              </div>
              <form class="flex flex-col gap-6" (submit)="$event.preventDefault(); vm.save()">
                <div hlmCardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div hlmField>
                    <label hlmFieldLabel for="hero-name">{{ vm.labels['name'].label }}</label>
                    <input hlmInput id="hero-name" [formField]="vm.heroForm.name" />
                    @for (e of vm.heroForm.name().errors(); track e.kind) {
                      <hlm-field-error>{{ e.message }}</hlm-field-error>
                    }
                  </div>

                  <div hlmField>
                    <label hlmFieldLabel for="hero-alias">{{ vm.labels['alias'].label }}</label>
                    <input hlmInput id="hero-alias" [formField]="vm.heroForm.alias" />
                    @for (e of vm.heroForm.alias().errors(); track e.kind) {
                      <hlm-field-error>{{ e.message }}</hlm-field-error>
                    }
                  </div>

                  <div hlmField>
                    <label hlmFieldLabel for="hero-power-class">{{ vm.labels['powerClass'].label }}</label>
                    <hlm-select [value]="vm.heroForm.powerClass().value()" (valueChange)="vm.setPowerClass($event)">
                      <hlm-select-trigger id="hero-power-class" class="w-full">
                        <hlm-select-value />
                      </hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal>
                        @for (option of vm.powerClassOptions; track option.value) {
                          <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                    @for (e of vm.heroForm.powerClass().errors(); track e.kind) {
                      <hlm-field-error>{{ e.message }}</hlm-field-error>
                    }
                  </div>

                  <div hlmField>
                    <label hlmFieldLabel for="hero-power">{{ vm.labels['powerIndex'].label }}</label>
                    <input hlmInput id="hero-power" type="number" [formField]="vm.heroForm.powerIndex" />
                    @for (e of vm.heroForm.powerIndex().errors(); track e.kind) {
                      <hlm-field-error>{{ e.message }}</hlm-field-error>
                    }
                  </div>
                </div>

                <div class="flex flex-wrap justify-end gap-2 border-t border-border p-6">
                  <button hlmBtn type="button" variant="outline" (click)="vm.cancel()">Cancel</button>
                  <button hlmBtn type="submit">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      } @else {
        <div hlmCard>
          <div hlmCardHeader>
            <h1 hlmCardTitle>Hero not found</h1>
          </div>
          <div hlmCardContent>
            <p class="text-sm text-muted-foreground">No hero on the roster has the ID "{{ vm.heroId() }}".</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
