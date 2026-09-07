import { Component, inject } from '@angular/core';
import { HeroForm } from '../ui/hero-form';
import { RecruitViewModel } from './recruit.view-model';

@Component({
  selector: 'app-recruit',
  providers: [RecruitViewModel],
  imports: [HeroForm],
  templateUrl: './recruit.html',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
