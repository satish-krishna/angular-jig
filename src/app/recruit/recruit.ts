import { Component, inject } from '@angular/core';
import { HeroForm } from '../ui/hero-form';
import { RecruitViewModel } from './recruit.view-model';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-recruit',
  providers: [RecruitViewModel],
  imports: [HeroForm, HlmCardImports],
  templateUrl: './recruit.html',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
