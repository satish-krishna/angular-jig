import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideRotateCcw, lucideSun } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { SettingsViewModel } from './settings.view-model';

/** The settings screen: the theme, and a confirmed reset of the example data. */
@Component({
  selector: 'app-settings',
  imports: [NgIcon, HlmButtonImports, HlmCardImports, HlmDialogImports],
  providers: [SettingsViewModel, provideIcons({ lucideMoon, lucideRotateCcw, lucideSun })],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
