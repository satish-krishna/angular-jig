import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeroForm } from '../ui/hero-form';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  providers: [HeroDetailViewModel],
  imports: [RouterLink, NgIcon, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HeroForm],
  templateUrl: './hero-detail.html',
})
export class HeroDetail implements OnInit {
  protected readonly vm = inject(HeroDetailViewModel);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.vm.heroId.set(this.route.snapshot.paramMap.get('id'));
  }
}
