import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { RecruitViewModel } from './recruit.view-model';

// Recruit a new hero: one schema-driven form, submitted through the form itself.
@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmIconImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmTypographyImports,
  ],
  providers: [RecruitViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
