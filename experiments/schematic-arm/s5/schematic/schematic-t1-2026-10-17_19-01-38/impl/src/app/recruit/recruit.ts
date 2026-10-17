import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH2, HlmMuted } from '@spartan-ng/helm/typography';
import { HeroForm } from '../ui/hero-form/hero-form';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  imports: [NgIcon, HlmIcon, HlmCardImports, HlmH2, HlmMuted, HeroForm],
  providers: [RecruitViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
