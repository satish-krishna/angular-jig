import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HlmButton } from '../../../libs/ui/button/src';
import { HlmBadge } from '../../../libs/ui/badge/src';
import {
  HlmAvatar,
  HlmAvatarImage,
  HlmAvatarFallback,
} from '../../../libs/ui/avatar/src';
import { NgIconsModule } from '@ng-icons/core';
import {
  lucideChevronLeft,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButton,
    HlmBadge,
    HlmAvatar,
    HlmAvatarImage,
    HlmAvatarFallback,
    NgIconsModule,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideChevronLeft,
    }),
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly vm = inject(HeroDetailViewModel);
  protected readonly Math = Math;
  protected readonly String = String;

  constructor() {
    // Set heroId from route params
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vm.setHeroId(id);
    }
  }

  protected getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  protected getAvatarUrl(heroId: string): string {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${heroId}`;
  }

  protected getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
        return 'outline';
      case 'MIA':
        return 'destructive';
      default:
        return 'default';
    }
  }

  protected onTabChange(value: string): void {
    this.vm.setSelectedTab(value as 'overview' | 'powers' | 'missions' | 'edit');
  }

  protected onNameChange(value: string): void {
    this.vm.modelValue.update(v => ({ ...v, name: value }));
  }

  protected onAliasChange(value: string): void {
    this.vm.modelValue.update(v => ({ ...v, alias: value }));
  }

  protected onPowerIndexChange(value: string): void {
    this.vm.modelValue.update(v => ({ ...v, powerIndex: Number(value) }));
  }

  protected onNotesChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.vm.modelValue.update(v => ({ ...v, notes: value }));
  }

  protected onPowerClassChange(value: any): void {
    this.vm.modelValue.update(v => ({ ...v, powerClass: value }));
  }

  protected onStatusChange(value: any): void {
    this.vm.modelValue.update(v => ({ ...v, status: value }));
  }
}
