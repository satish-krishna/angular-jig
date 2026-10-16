import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { RecruitViewModel } from './recruit.view-model';

/** The recruit screen: an intake form that files a new hero onto the roster. */
@Component({
  selector: 'app-recruit',
  imports: [
    FormField,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmTextarea,
  ],
  providers: [RecruitViewModel],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
