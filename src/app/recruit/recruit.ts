import { Component, inject } from '@angular/core';
import { HeroForm } from '../ui/hero-form/hero-form';
import { RecruitViewModel } from './recruit.view-model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmH1 } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-recruit',
  providers: [RecruitViewModel],
  imports: [HeroForm, HlmCardImports, HlmH1],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
