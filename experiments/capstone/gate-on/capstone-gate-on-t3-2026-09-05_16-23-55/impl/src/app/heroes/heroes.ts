import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButton } from '../../../libs/ui/button/src';
import { HlmInput } from '../../../libs/ui/input/src';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectItem,
  HlmSelectValue,
} from '../../../libs/ui/select/src';
import {
  HlmTable,
  HlmTHead,
  HlmTBody,
  HlmTr,
  HlmTh,
  HlmTd,
} from '../../../libs/ui/table/src';
import { HlmBadge } from '../../../libs/ui/badge/src';
import {
  HlmAvatar,
  HlmAvatarImage,
  HlmAvatarFallback,
} from '../../../libs/ui/avatar/src';
import { NgIconsModule } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePencil,
  lucideTrash2,
  lucideUserPlus,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { RosterViewModel } from './roster.view-model';
import { HeroCardComponent } from '../ui/hero-card.component';
import { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-heroes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButton,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectValue,
    HlmTable,
    HlmTHead,
    HlmTBody,
    HlmTr,
    HlmTh,
    HlmTd,
    HlmBadge,
    HlmAvatar,
    HlmAvatarImage,
    HlmAvatarFallback,
    NgIconsModule,
    HeroCardComponent,
  ],
  providers: [
    RosterViewModel,
    provideIcons({
      lucideSearch,
      lucidePencil,
      lucideTrash2,
      lucideUserPlus,
      lucideChevronDown,
    }),
  ],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(RosterViewModel);

  protected readonly onClassChange = (event: any) => {
    const value = event?.target?.value || event;
    this.vm.setSelectedClass(value);
  };

  getInitials(hero: Hero): string {
    const parts = hero.name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarUrl(heroId: string): string {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${heroId}`;
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
        return 'outline';
      case 'MIA':
        return 'secondary';
      default:
        return 'default';
    }
  }

  getClearanceVariant(tier: string): 'default' | 'secondary' | 'outline' {
    if (tier === 'Tier4') return 'default';
    if (tier === 'Tier1') return 'secondary';
    return 'secondary';
  }
}
