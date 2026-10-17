import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRotateCcw } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

// Settings: the light or dark choice, and a way back to the example data.
@Component({
  selector: 'app-settings',
  imports: [
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmIconImports,
    HlmLabelImports,
    HlmSwitchImports,
    HlmTypographyImports,
  ],
  providers: [SettingsViewModel, provideIcons({ lucideRotateCcw })],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
