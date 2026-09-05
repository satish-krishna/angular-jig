import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideChevronDown,
  lucidePencil,
  lucideTrash2,
  lucideUserCheck,
  lucideCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { RosterViewModel } from './roster-view-model';
import type { PowerClass } from '../domain/hero.model';

@Component({
  selector: 'app-roster',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIconsModule,
    ...HlmInputImports,
    ...HlmButtonImports,
    ...HlmSelectImports,
    ...HlmBadgeImports,
    ...HlmTableImports,
  ],
  providers: [
    RosterViewModel,
    provideIcons({
      lucideSearch,
      lucideChevronDown,
      lucidePencil,
      lucideTrash2,
      lucideUserCheck,
      lucideCheck,
      lucideTriangleAlert,
    }),
  ],
  templateUrl: './roster.html',
  styleUrl: './roster.css',
})
export class Roster {
  protected readonly vm = inject(RosterViewModel);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.vm.setSearchTerm(input.value);
  }

  onClassFilterChange(value: string): void {
    this.vm.setClassFilter((value || '') as PowerClass | '');
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to retire this hero?')) {
      this.vm.deleteHero(id);
    }
  }
}
