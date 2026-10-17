import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideUserPlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelect, HlmSelectContent, HlmSelectItem, HlmSelectPortal, HlmSelectTrigger, HlmSelectValue } from '@spartan-ng/helm/select';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmH1, HlmMuted } from '@spartan-ng/helm/typography';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    FormRoot,
    NgIcon,
    HlmIcon,
    HlmButton,
    HlmFieldImports,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectPortal,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmTextarea,
    HlmH1,
    HlmMuted,
  ],
  providers: [RecruitViewModel, provideIcons({ lucideChevronLeft, lucideUserPlus })],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
