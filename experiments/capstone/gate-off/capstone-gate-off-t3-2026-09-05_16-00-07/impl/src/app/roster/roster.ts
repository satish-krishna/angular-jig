import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideUserPlus,
  lucidePencil,
  lucideTrash2,
  lucideZap,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectItem,
  HlmSelectTrigger,
  HlmSelectValue,
} from '@spartan-ng/helm/select';
import {
  HlmTable,
  HlmTHead,
  HlmTBody,
  HlmTr,
  HlmTh,
  HlmTd,
} from '@spartan-ng/helm/table';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';
import { NgIcon } from '@ng-icons/core';
import { RosterViewModel } from './roster.viewmodel';
import type { HeroStatus } from '../domain/hero.model';

@Component({
  selector: 'app-roster',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HlmButton,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmTable,
    HlmTHead,
    HlmTBody,
    HlmTr,
    HlmTh,
    HlmTd,
    HlmBadge,
    HlmAvatar,
    HlmAvatarFallback,
    HlmCard,
    HlmCardContent,
    NgIcon,
  ],
  providers: [
    RosterViewModel,
    provideIcons({
      lucideUserPlus,
      lucidePencil,
      lucideTrash2,
      lucideZap,
      lucideUsers,
    }),
  ],
  templateUrl: './roster.html',
  styleUrl: './roster.css',
})
export class Roster {
  readonly vm = inject(RosterViewModel);

  statusVariant(status: HeroStatus): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
      case 'MIA':
        return 'outline';
    }
  }

  statusSemanticClass(status: HeroStatus): string {
    switch (status) {
      case 'Active':
        return 'bg-success text-white';
      case 'Injured':
        return 'bg-warning text-white';
      case 'MIA':
      case 'Reserve':
        return 'bg-destructive text-white';
    }
  }
}
