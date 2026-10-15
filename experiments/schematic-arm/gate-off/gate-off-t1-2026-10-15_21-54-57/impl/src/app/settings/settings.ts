import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmButtonImports, HlmCardImports],
  providers: [SettingsViewModel],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex min-w-0 flex-col gap-1">
        <h1 class="text-2xl font-semibold">Settings</h1>
        <p class="text-sm text-muted-foreground">Console preferences for this browser.</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section hlmCard aria-labelledby="appearance-heading">
          <div hlmCardHeader>
            <h2 id="appearance-heading" hlmCardTitle>Appearance</h2>
            <p hlmCardDescription>Saved in this browser. Match system follows your operating system.</p>
          </div>
          <div hlmCardContent class="flex flex-wrap gap-2" role="group" aria-label="Theme">
            @for (option of vm.themeOptions; track option.value) {
              <button
                hlmBtn
                [variant]="option.value === vm.themeChoice() ? 'default' : 'outline'"
                [attr.aria-pressed]="option.value === vm.themeChoice()"
                (click)="vm.setTheme(option.value)"
              >
                {{ option.label }}
              </button>
            }
          </div>
        </section>

        <section hlmCard aria-labelledby="data-heading">
          <div hlmCardHeader>
            <h2 id="data-heading" hlmCardTitle>Console data</h2>
            <p hlmCardDescription>Example data. Edits last until the page reloads.</p>
          </div>
          <div hlmCardContent>
            <dl class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex flex-col gap-1">
                <dt class="text-muted-foreground">Heroes on roster</dt>
                <dd class="font-medium tabular-nums">{{ vm.heroCount() }}</dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-muted-foreground">Open threats</dt>
                <dd class="font-medium tabular-nums">{{ vm.openThreats() }}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
