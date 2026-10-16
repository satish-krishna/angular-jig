import { Component, inject } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmButton, HlmCardImports, HlmLabel, HlmSwitchImports],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
