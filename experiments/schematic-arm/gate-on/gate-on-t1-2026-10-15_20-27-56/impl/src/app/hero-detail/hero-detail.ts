import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideChevronLeft, lucideCrosshair, lucideTrash2, lucideZap } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PowerMeter } from '../ui/power-meter';
import { StatTile } from '../ui/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  imports: [
    RouterLink,
    NgIcon,
    FormField,
    ...HlmAvatarImports,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmDialogImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmSelectImports,
    ...HlmTabsImports,
    ...HlmTextareaImports,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideChevronLeft, lucideCrosshair, lucideTrash2, lucideZap }),
  ],
  template: `
    <section class="flex flex-col gap-6">
      <a hlmBtn variant="ghost" size="sm" class="self-start" routerLink="/roster">
        <ng-icon name="lucideChevronLeft" />
        Back to roster
      </a>

      @if (vm.hero(); as hero) {
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex min-w-0 items-center gap-4">
            <hlm-avatar aria-hidden="true">
              <span hlmAvatarFallback>{{ vm.initials() }}</span>
            </hlm-avatar>
            <div class="flex min-w-0 flex-col gap-1">
              <h1 class="text-2xl font-semibold break-words">{{ hero.name }}</h1>
              <p class="text-sm text-muted-foreground break-words">{{ hero.id }} · {{ hero.alias }}</p>
              <div class="flex flex-wrap gap-1">
                <span hlmBadge variant="outline">{{ hero.powerClass }}</span>
                <span hlmBadge [variant]="vm.statusVariant()">{{ hero.status }}</span>
                <span hlmBadge variant="secondary">{{ hero.clearance }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button hlmBtn variant="outline" type="button" [disabled]="!vm.canDeploy()" (click)="vm.deploy()">
              <ng-icon name="lucideCrosshair" />
              Deploy
            </button>

            <hlm-dialog #retireDialog>
              <button hlmBtn variant="destructive" hlmDialogTrigger>
                <ng-icon name="lucideTrash2" />
                Retire
              </button>
              <hlm-dialog-content *hlmDialogPortal>
                <hlm-dialog-header>
                  <h2 hlmDialogTitle>Retire {{ hero.name }}?</h2>
                  <p hlmDialogDescription>
                    The record leaves the roster. This console cannot restore it.
                  </p>
                </hlm-dialog-header>
                <hlm-dialog-footer>
                  <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>
                  <button hlmBtn variant="destructive" type="button" (click)="retireDialog.close(); vm.retire()">
                    Retire hero
                  </button>
                </hlm-dialog-footer>
              </hlm-dialog-content>
            </hlm-dialog>
          </div>
        </header>

        @if (vm.notice()) {
          <p role="status" class="text-sm text-muted-foreground">{{ vm.notice() }}</p>
        }

        <hlm-tabs tab="overview" class="w-full">
          <div class="-mx-1 overflow-x-auto px-1">
            <hlm-tabs-list aria-label="Hero sections" class="flex w-max min-w-full">
              <button hlmTabsTrigger="overview">Overview</button>
              <button hlmTabsTrigger="powers">Powers</button>
              <button hlmTabsTrigger="missions">Missions</button>
              <button hlmTabsTrigger="edit">Edit</button>
            </hlm-tabs-list>
          </div>

          <div hlmTabsContent="overview">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <app-stat-tile label="Power index" [value]="hero.power" hint="0-100">
                  <ng-icon statIcon name="lucideZap" />
                </app-stat-tile>
                <app-stat-tile label="Missions" [value]="hero.missions" hint="On record">
                  <ng-icon statIcon name="lucideActivity" />
                </app-stat-tile>
                <app-stat-tile label="Success rate" [value]="hero.successRate + '%'" hint="Of missions">
                  <ng-icon statIcon name="lucideCheck" />
                </app-stat-tile>
              </div>

              <div hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>Dossier</h2>
                </div>
                <div hlmCardContent class="flex flex-col gap-4">
                  <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div class="flex flex-col">
                      <dt class="text-muted-foreground">Roster ID</dt>
                      <dd>{{ hero.id }}</dd>
                    </div>
                    <div class="flex flex-col">
                      <dt class="text-muted-foreground">Civilian alias</dt>
                      <dd class="break-words">{{ hero.alias }}</dd>
                    </div>
                    <div class="flex flex-col">
                      <dt class="text-muted-foreground">Power class</dt>
                      <dd>{{ hero.powerClass }}</dd>
                    </div>
                    <div class="flex flex-col">
                      <dt class="text-muted-foreground">Clearance</dt>
                      <dd>{{ hero.clearance }}</dd>
                    </div>
                    <div class="flex flex-col">
                      <dt class="text-muted-foreground">Status</dt>
                      <dd>{{ hero.status }}</dd>
                    </div>
                  </dl>
                  <p class="text-sm break-words">{{ hero.dossier }}</p>
                </div>
              </div>
            </div>
          </div>

          <div hlmTabsContent="powers">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>Power index</h2>
                </div>
                <div hlmCardContent>
                  <app-power-meter [value]="hero.power" />
                </div>
              </div>

              <div hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>Classification</h2>
                </div>
                <div hlmCardContent class="flex flex-col gap-3">
                  <div class="flex flex-wrap gap-1">
                    <span hlmBadge variant="outline">{{ hero.powerClass }}</span>
                    <span hlmBadge variant="secondary">{{ hero.clearance }}</span>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    The example roster carries no per-ability record. Classification and clearance stand in for it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div hlmTabsContent="missions">
            <div hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>Deployments</h2>
              </div>
              <div hlmCardContent class="flex flex-col gap-3">
                <div class="flex flex-wrap gap-2">
                  <span hlmBadge variant="default">{{ vm.successfulMissions() }} successful</span>
                  <span hlmBadge variant="destructive">{{ vm.failedMissions() }} unsuccessful</span>
                  <span hlmBadge variant="outline">{{ hero.missions }} total</span>
                </div>
                <p class="text-sm text-muted-foreground">
                  The example roster keeps counts, not a mission log. Results are derived from the success rate.
                </p>
              </div>
            </div>
          </div>

          <div hlmTabsContent="edit">
            <form class="flex flex-col gap-6" (submit)="$event.preventDefault(); vm.save()">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmFieldLabel for="hero-name">{{ vm.meta['name'].label }}</label>
                  <input
                    hlmInput
                    id="hero-name"
                    type="text"
                    [placeholder]="vm.meta['name'].placeholder ?? ''"
                    [formField]="vm.heroForm.name"
                  />
                  @for (e of vm.heroForm.name().errors(); track e.kind) {
                    <hlm-field-error>{{ e.message }}</hlm-field-error>
                  }
                </hlm-field>

                <hlm-field>
                  <label hlmFieldLabel for="hero-alias">{{ vm.meta['alias'].label }}</label>
                  <input
                    hlmInput
                    id="hero-alias"
                    type="text"
                    [placeholder]="vm.meta['alias'].placeholder ?? ''"
                    [formField]="vm.heroForm.alias"
                  />
                  @for (e of vm.heroForm.alias().errors(); track e.kind) {
                    <hlm-field-error>{{ e.message }}</hlm-field-error>
                  }
                </hlm-field>

                <hlm-field>
                  <label hlmFieldLabel for="hero-power-class">{{ vm.meta['powerClass'].label }}</label>
                  <hlm-select [value]="vm.heroForm.powerClass().value()" (valueChange)="vm.setPowerClass($event)">
                    <hlm-select-trigger buttonId="hero-power-class" class="w-full">
                      <hlm-select-value />
                    </hlm-select-trigger>
                    <hlm-select-content *hlmSelectPortal>
                      @for (option of vm.powerClasses; track option) {
                        <hlm-select-item [value]="option">{{ option }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </hlm-select>
                  @for (e of vm.heroForm.powerClass().errors(); track e.kind) {
                    <hlm-field-error>{{ e.message }}</hlm-field-error>
                  }
                </hlm-field>

                <hlm-field>
                  <label hlmFieldLabel for="hero-power">{{ vm.meta['power'].label }}</label>
                  <input hlmInput id="hero-power" type="number" [formField]="vm.heroForm.power" />
                  <p hlmFieldDescription>{{ vm.meta['power'].help }}</p>
                  @for (e of vm.heroForm.power().errors(); track e.kind) {
                    <hlm-field-error>{{ e.message }}</hlm-field-error>
                  }
                </hlm-field>

                <hlm-field class="sm:col-span-2">
                  <label hlmFieldLabel for="hero-dossier">{{ vm.meta['dossier'].label }}</label>
                  <textarea hlmTextarea id="hero-dossier" rows="5" [formField]="vm.heroForm.dossier"></textarea>
                  <p hlmFieldDescription>{{ vm.meta['dossier'].help }}</p>
                  @for (e of vm.heroForm.dossier().errors(); track e.kind) {
                    <hlm-field-error>{{ e.message }}</hlm-field-error>
                  }
                </hlm-field>
              </div>

              <div class="flex flex-wrap justify-end gap-2">
                <button hlmBtn variant="outline" type="button" (click)="vm.cancelEdit()">Cancel</button>
                <button hlmBtn type="submit">Save</button>
              </div>
            </form>
          </div>
        </hlm-tabs>
      } @else {
        <p role="alert" class="text-sm text-muted-foreground">No hero on the roster has that ID.</p>
      }
    </section>
  `,
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
