import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  providers: [SettingsViewModel],
  imports: [
    HlmButtonImports,
    HlmCardImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmSwitchImports,
  ],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
