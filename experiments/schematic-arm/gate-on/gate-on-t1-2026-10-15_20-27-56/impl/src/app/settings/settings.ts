import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [NgIcon, ...HlmButtonImports, ...HlmCardImports, ...HlmDialogImports],
  providers: [SettingsViewModel, provideIcons({ lucideMoon, lucideSun })],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Settings</h1>
        <p class="text-sm text-muted-foreground">Console preferences and the roster data behind every screen.</p>
      </header>

      @if (vm.notice()) {
        <p role="status" class="text-sm text-muted-foreground">{{ vm.notice() }}</p>
      }

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Appearance</h2>
          </div>
          <div hlmCardContent class="flex flex-col gap-3">
            <p class="text-sm text-muted-foreground">The theme is also one click away in the top bar.</p>
            <div>
              <button hlmBtn variant="outline" type="button" [attr.aria-pressed]="vm.isDark()" (click)="vm.toggleTheme()">
                <ng-icon [name]="vm.isDark() ? 'lucideSun' : 'lucideMoon'" />
                Dark theme
              </button>
            </div>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Roster data</h2>
          </div>
          <div hlmCardContent class="flex flex-col gap-3">
            <p class="text-sm text-muted-foreground">
              {{ vm.rosterCount() }} heroes on the roster. The roster is example data kept in memory: it resets on
              every page load.
            </p>
            <div>
              <hlm-dialog #restoreDialog>
                <button hlmBtn variant="outline" hlmDialogTrigger>Restore example roster</button>
                <hlm-dialog-content *hlmDialogPortal>
                  <hlm-dialog-header>
                    <h2 hlmDialogTitle>Restore the example roster?</h2>
                    <p hlmDialogDescription>
                      Every edit, recruit, deployment, and retirement made this session is discarded.
                    </p>
                  </hlm-dialog-header>
                  <hlm-dialog-footer>
                    <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>
                    <button
                      hlmBtn
                      variant="destructive"
                      type="button"
                      (click)="restoreDialog.close(); vm.restoreExampleRoster()"
                    >
                      Restore roster
                    </button>
                  </hlm-dialog-footer>
                </hlm-dialog-content>
              </hlm-dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
