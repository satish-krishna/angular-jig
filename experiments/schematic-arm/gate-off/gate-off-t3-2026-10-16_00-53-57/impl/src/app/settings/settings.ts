import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { SettingsViewModel } from './settings.view-model';

/** The settings screen: the appearance choice and a note on where the console keeps its records. */
@Component({
  selector: 'app-settings',
  imports: [HlmCardImports, HlmLabelImports, HlmSwitchImports],
  providers: [SettingsViewModel],
  template: `
    <div class="flex flex-col gap-8">
      <header class="min-w-0">
        <h1 class="text-2xl font-semibold">Settings</h1>
        <p class="text-sm text-muted-foreground">Console preferences for this browser.</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section hlmCard aria-labelledby="appearance-heading" class="self-start">
          <div hlmCardHeader>
            <h2 id="appearance-heading" hlmCardTitle>Appearance</h2>
            <p hlmCardDescription>Your choice is saved in this browser. Until you choose, the system setting decides.</p>
          </div>
          <div hlmCardContent class="flex items-center gap-3">
            <hlm-switch inputId="dark-theme" [checked]="vm.isDark()" (checkedChange)="vm.setDark($event)" />
            <label hlmLabel for="dark-theme">Dark theme</label>
          </div>
        </section>

        <section hlmCard aria-labelledby="data-heading" class="self-start">
          <div hlmCardHeader>
            <h2 id="data-heading" hlmCardTitle>Data</h2>
            <p hlmCardDescription>Example data, for demonstration only.</p>
          </div>
          <div hlmCardContent class="flex flex-col gap-2">
            <p>{{ vm.recordCount() }} hero records are held in memory.</p>
            <p class="text-sm text-muted-foreground">Edits and recruits last until the page reloads.</p>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
