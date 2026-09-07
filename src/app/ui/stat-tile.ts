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
        <div hlmCardAction>
          <ng-icon [name]="icon()" class="size-8 text-muted-foreground" />
        </div>
      </hlm-card-header>
      <div hlmCardContent>
        <p class="text-3xl font-bold text-foreground">{{ value() }}</p>
      </div>
    </hlm-card>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
}
