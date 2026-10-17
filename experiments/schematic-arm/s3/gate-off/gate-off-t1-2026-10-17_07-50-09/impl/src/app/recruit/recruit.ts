import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmH1, HlmMuted } from '@spartan-ng/helm/typography';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    HlmButton,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmTextareaImports,
    HlmH1,
    HlmMuted,
  ],
  providers: [RecruitViewModel],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
