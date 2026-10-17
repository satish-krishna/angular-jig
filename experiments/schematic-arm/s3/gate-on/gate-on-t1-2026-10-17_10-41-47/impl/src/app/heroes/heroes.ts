import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardFooter } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelect, HlmSelectContent, HlmSelectItem, HlmSelectPortal, HlmSelectTrigger, HlmSelectValue } from '@spartan-ng/helm/select';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { RosterTable } from '../ui/roster-table/roster-table';
import { RosterViewModel } from './heroes.view-model';

@Component({
  selector: 'app-heroes',
  imports: [
    RouterLink,
    NgIcon,
    HlmIcon,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardFooter,
    HlmField,
    HlmFieldLabel,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectPortal,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmH1,
    HlmMuted,
    HlmSmall,
    RosterTable,
  ],
  providers: [RosterViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(RosterViewModel);
}
