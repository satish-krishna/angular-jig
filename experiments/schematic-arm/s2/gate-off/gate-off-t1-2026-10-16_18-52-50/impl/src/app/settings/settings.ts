import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { SettingsViewModel } from './settings.view-model';

/** The settings screen: the theme preference and a note on how the console keeps its state. */
@Component({
  selector: 'app-settings',
  imports: [HlmCardImports, HlmFieldImports, HlmSelectImports],
  providers: [SettingsViewModel],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
