import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

// The settings screen: console appearance and the reset for the session's example data.
@Component({
  selector: 'app-settings',
  imports: [HlmButtonImports, HlmCardImports, HlmLabelImports, HlmSwitchImports, HlmTypographyImports],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
