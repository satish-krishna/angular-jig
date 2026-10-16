import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideChevronLeft,
  lucideCrosshair,
  lucideTarget,
  lucideTrash2,
  lucideUserCheck,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { initialsOf } from '../domain/initials';
import { statusVariant } from '../ui/hero-status-variant';
import { formMeta } from '../forms/zod-meta';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { heroSchema } from './hero-detail.schema';
import { HeroDetailViewModel } from './hero-detail.view-model';

/** The hero detail screen: header and actions, four tabbed panels, and the retire confirmation. */
@Component({
  selector: 'app-hero-detail',
  imports: [
    FormField,
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSwitchImports,
    HlmTabsImports,
    HlmTextareaImports,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideActivity,
      lucideChevronLeft,
      lucideCrosshair,
      lucideTarget,
      lucideTrash2,
      lucideUserCheck,
      lucideZap,
    }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <a hlmBtn variant="ghost" routerLink="/roster" class="self-start">
        <ng-icon name="lucideChevronLeft" aria-hidden="true" />
        Back to roster
      </a>

      @let hero = vm.hero();
      @if (hero) {
        <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <hlm-avatar size="lg" aria-hidden="true">
              <span hlmAvatarFallback>{{ initialsOf(hero.name) }}</span>
            </hlm-avatar>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">{{ hero.id }}</p>
              <h1 class="text-2xl font-semibold break-words">{{ hero.name }}</h1>
              <p class="text-sm text-muted-foreground">{{ hero.alias }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span hlmBadge variant="secondary">{{ hero.powerClass }}</span>
                <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button hlmBtn variant="outline" type="button" [disabled]="!vm.canDeploy()" (click)="vm.deploy()">
              <ng-icon name="lucideCrosshair" aria-hidden="true" />
              Deploy
            </button>

            <hlm-dialog #retireDialog>
              <button hlmBtn variant="destructive" type="button" hlmDialogTrigger>
                <ng-icon name="lucideTrash2" aria-hidden="true" />
                Retire
              </button>
              <hlm-dialog-content *hlmDialogPortal>
                <hlm-dialog-header>
                  <h2 hlmDialogTitle>Retire {{ hero.name }}?</h2>
                  <p hlmDialogDescription>
                    {{ hero.name }} is removed from the roster. This console keeps no archive, so the record cannot be
                    restored from here.
                  </p>
                </hlm-dialog-header>
                <hlm-dialog-footer>
                  <button hlmBtn variant="outline" type="button" (click)="retireDialog.close()">Cancel</button>
                  <button hlmBtn variant="destructive" type="button" (click)="retire(retireDialog)">
                    Retire hero
                  </button>
                </hlm-dialog-footer>
              </hlm-dialog-content>
            </hlm-dialog>
          </div>
        </header>

        <p role="status" class="min-h-5 text-sm text-muted-foreground">{{ vm.notice() }}</p>

        <hlm-tabs tab="overview" class="flex flex-col gap-4">
          <div class="max-w-full overflow-x-auto">
            <hlm-tabs-list aria-label="Hero sections">
              <button hlmTabsTrigger="overview">Overview</button>
              <button hlmTabsTrigger="powers">Powers</button>
              <button hlmTabsTrigger="missions">Missions</button>
              <button hlmTabsTrigger="edit">Edit</button>
            </hlm-tabs-list>
          </div>

          <div hlmTabsContent="overview">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section hlmCard aria-labelledby="field-summary-heading">
                <div hlmCardHeader>
                  <h2 id="field-summary-heading" hlmCardTitle>Field summary</h2>
                  <p hlmCardDescription>{{ hero.notes }}</p>
                </div>
                <div hlmCardContent class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <app-stat-tile label="Missions" icon="lucideTarget" [value]="hero.missionCount" />
                  <app-stat-tile label="Success" icon="lucideActivity" [value]="hero.successRate + '%'" />
                  <app-stat-tile label="Power index" icon="lucideZap" [value]="hero.powerIndex" />
                </div>
              </section>

              <section hlmCard aria-labelledby="dossier-heading">
                <div hlmCardHeader>
                  <h2 id="dossier-heading" hlmCardTitle>Dossier</h2>
                </div>
                <div hlmCardContent>
                  <dl class="flex flex-col gap-3 text-sm">
                    <div class="flex flex-wrap justify-between gap-x-4">
                      <dt class="text-muted-foreground">Hero ID</dt>
                      <dd class="font-medium">{{ hero.id }}</dd>
                    </div>
                    <div class="flex flex-wrap justify-between gap-x-4">
                      <dt class="text-muted-foreground">Alias</dt>
                      <dd class="font-medium">{{ hero.alias }}</dd>
                    </div>
                    <div class="flex flex-wrap justify-between gap-x-4">
                      <dt class="text-muted-foreground">Power class</dt>
                      <dd class="font-medium">{{ hero.powerClass }}</dd>
                    </div>
                    <div class="flex flex-wrap justify-between gap-x-4">
                      <dt class="text-muted-foreground">Status</dt>
                      <dd class="font-medium">{{ hero.status }}</dd>
                    </div>
                    <div class="flex flex-wrap justify-between gap-x-4">
                      <dt class="text-muted-foreground">Clearance</dt>
                      <dd class="font-medium">{{ hero.clearance }}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>
          </div>

          <div hlmTabsContent="powers">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section hlmCard aria-labelledby="power-profile-heading">
                <div hlmCardHeader>
                  <h2 id="power-profile-heading" hlmCardTitle>Power profile</h2>
                </div>
                <div hlmCardContent>
                  <app-power-meter [value]="hero.powerIndex" [label]="'Power index for ' + hero.name" />
                </div>
              </section>

              <section hlmCard aria-labelledby="ability-badges-heading">
                <div hlmCardHeader>
                  <h2 id="ability-badges-heading" hlmCardTitle>Classification</h2>
                </div>
                <div hlmCardContent class="flex flex-wrap gap-2">
                  <span hlmBadge variant="secondary">{{ hero.powerClass }}</span>
                  <span hlmBadge variant="outline">{{ hero.clearance }}</span>
                  <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
                </div>
              </section>
            </div>
          </div>

          <div hlmTabsContent="missions">
            <section hlmCard aria-labelledby="mission-record-heading">
              <div hlmCardHeader>
                <h2 id="mission-record-heading" hlmCardTitle>Mission record</h2>
                <p hlmCardDescription>Totals across every deployment on record.</p>
              </div>
              <div hlmCardContent class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span hlmBadge variant="outline">{{ hero.missionCount }} missions</span>
                  <span hlmBadge variant="secondary">{{ hero.successRate }}% success</span>
                </div>
                <p class="text-sm text-muted-foreground">
                  Individual deployment entries are not part of the roster record, so only totals are shown here.
                </p>
              </div>
            </section>
          </div>

          <div hlmTabsContent="edit">
            <section hlmCard aria-labelledby="edit-heading">
              <div hlmCardHeader>
                <h2 id="edit-heading" hlmCardTitle>Edit {{ hero.name }}</h2>
                <p hlmCardDescription>Changes are saved to the roster record.</p>
              </div>
              <div hlmCardContent>
                <form novalidate class="flex flex-col gap-6" (submit)="vm.save($event)">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div hlmField>
                      <label hlmFieldLabel for="hero-name">{{ meta.name.label }}</label>
                      <input hlmInput id="hero-name" [formField]="vm.form.name" />
                      @for (error of vm.form.name().errors(); track error.kind) {
                        <hlm-field-error>{{ error.message }}</hlm-field-error>
                      }
                    </div>

                    <div hlmField>
                      <label hlmFieldLabel for="hero-alias">{{ meta.alias.label }}</label>
                      <input hlmInput id="hero-alias" [formField]="vm.form.alias" />
                      @for (error of vm.form.alias().errors(); track error.kind) {
                        <hlm-field-error>{{ error.message }}</hlm-field-error>
                      }
                    </div>

                    <div hlmField>
                      <label hlmFieldLabel for="hero-power-class">{{ meta.powerClass.label }}</label>
                      <hlm-select [formField]="vm.form.powerClass">
                        <hlm-select-trigger class="w-full" buttonId="hero-power-class">
                          <hlm-select-value />
                        </hlm-select-trigger>
                        <hlm-select-content *hlmSelectPortal>
                          @for (option of meta.powerClass.options ?? []; track option.value) {
                            <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </hlm-select>
                      @for (error of vm.form.powerClass().errors(); track error.kind) {
                        <hlm-field-error>{{ error.message }}</hlm-field-error>
                      }
                    </div>

                    <div hlmField>
                      <label hlmFieldLabel for="hero-power-index">{{ meta.powerIndex.label }}</label>
                      <input hlmInput id="hero-power-index" type="number" [formField]="vm.form.powerIndex" />
                      <p hlmFieldDescription>{{ meta.powerIndex.help }}</p>
                      @for (error of vm.form.powerIndex().errors(); track error.kind) {
                        <hlm-field-error>{{ error.message }}</hlm-field-error>
                      }
                    </div>

                    <div hlmField class="sm:col-span-2">
                      <label hlmFieldLabel for="hero-notes">{{ meta.notes.label }}</label>
                      <textarea hlmTextarea id="hero-notes" [formField]="vm.form.notes"></textarea>
                      @for (error of vm.form.notes().errors(); track error.kind) {
                        <hlm-field-error>{{ error.message }}</hlm-field-error>
                      }
                    </div>

                    <div hlmField orientation="horizontal" class="sm:col-span-2">
                      <hlm-switch inputId="hero-active" [formField]="vm.form.active" />
                      <label hlmFieldLabel for="hero-active">{{ meta.active.label }}</label>
                      <p hlmFieldDescription>{{ meta.active.help }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap justify-end gap-2">
                    <button hlmBtn variant="outline" type="button" (click)="vm.cancel()">Cancel</button>
                    <button hlmBtn type="submit">Save changes</button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </hlm-tabs>
      } @else {
        <section class="flex flex-col gap-2" aria-labelledby="not-found-heading">
          <h1 id="not-found-heading" class="text-2xl font-semibold">Hero not found</h1>
          <p class="text-sm text-muted-foreground">
            No hero matches this ID. The roster lists every hero on record.
          </p>
        </section>
      }
    </div>
  `,
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
  private readonly router = inject(Router);
  protected readonly meta = formMeta(heroSchema);
  protected readonly initialsOf = initialsOf;
  protected readonly statusVariant = statusVariant;

  /** Closes the confirmation, then leaves the screen once the hero is removed. */
  protected retire(dialog: HlmDialog): void {
    dialog.close();
    if (this.vm.retire()) {
      void this.router.navigateByUrl('/roster');
    }
  }
}
