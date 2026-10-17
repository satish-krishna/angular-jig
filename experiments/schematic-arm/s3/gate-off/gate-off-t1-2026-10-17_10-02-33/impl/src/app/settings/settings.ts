import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

// The settings screen: the theme choice and a confirmed reset of the example data. All state lives in SettingsViewModel.
@Component({
  selector: 'app-settings',
  imports: [
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTypographyImports,
  ],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
