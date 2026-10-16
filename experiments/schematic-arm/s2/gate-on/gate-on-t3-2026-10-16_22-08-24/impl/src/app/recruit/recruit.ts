import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [FormField, FormRoot, RouterLink, NgIcon, HlmButton, HlmCardImports, HlmFieldImports, HlmInput, HlmSelectImports],
  providers: [RecruitViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
