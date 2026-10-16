import { Component, inject } from '@angular/core';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmFieldImports, HlmSelectImports],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
