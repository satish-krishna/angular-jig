import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
  template: `
    <hlm-card>
      <hlm-card-header>
        <p hlmCardDescription>{{ label() }}</p>
        <h3 hlmCardTitle>{{ value() }}</h3>
        <div hlmCardAction>
          <ng-icon [name]="icon()" class="size-8 text-muted-foreground" />
        </div>
      </hlm-card-header>
    </hlm-card>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
}
