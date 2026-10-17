import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroForm } from '../ui/hero-form/hero-form';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [HlmCardImports, HlmTypographyImports, HeroForm],
  providers: [RecruitViewModel],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
