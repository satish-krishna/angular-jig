import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmH1 } from '@spartan-ng/helm/typography';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  providers: [SettingsViewModel],
  imports: [HlmCardImports, HlmLabelImports, HlmSelectImports, HlmSwitchImports, HlmH1],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);

  protected readonly themeToString = (value: string) =>
    this.vm.themeOptions.find((option) => option.value === value)?.label ?? '';

  protected readonly sortToString = (value: string) =>
    this.vm.sortOptions.find((option) => option.value === value)?.label ?? '';

  protected readonly statusToString = (value: string) => {
    const statusOptions = [
      { value: 'all', label: 'All statuses' },
      { value: 'Active', label: 'Active' },
      { value: 'Injured', label: 'Injured' },
      { value: 'Reserve', label: 'Reserve' },
      { value: 'MIA', label: 'MIA' },
    ];
    return statusOptions.find((option) => option.value === value)?.label ?? '';
  };
}
