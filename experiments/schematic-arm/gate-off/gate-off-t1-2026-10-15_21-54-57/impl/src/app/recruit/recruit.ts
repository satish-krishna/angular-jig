import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
  ],
  providers: [RecruitViewModel],
  templateUrl: './recruit.html',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
