import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRotateCcw } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

// Settings: the example data reset and a short note on how the console keeps its state.
@Component({
  selector: 'app-settings',
  imports: [NgIcon, HlmButtonImports, HlmCardImports, HlmDialogImports, HlmIconImports, HlmTypographyImports],
  providers: [SettingsViewModel, provideIcons({ lucideRotateCcw })],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
