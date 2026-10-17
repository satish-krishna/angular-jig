import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmCardImports, HlmSwitchImports, HlmH3, HlmMuted, HlmSmall],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
