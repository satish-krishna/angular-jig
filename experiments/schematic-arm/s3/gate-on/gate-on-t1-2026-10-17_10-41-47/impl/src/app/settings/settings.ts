import { Component, inject } from '@angular/core';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle, HlmSwitch, HlmH1, HlmMuted, HlmSmall],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
