import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-heroes',
  imports: [RouterLink, HlmCardImports, HlmButtonImports],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <h1 class="text-3xl font-bold">Heroes</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (hero of heroes; track hero.id) {
          <div hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ hero.name }}</h2>
            </div>
            <div hlmCardContent class="flex flex-col gap-2">
              <p class="text-muted-foreground">ID: {{ hero.id }}</p>
            </div>
            <div hlmCardFooter>
              <a
                [routerLink]="['/detail', hero.id]"
                hlmBtn
              >
                View Details
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class Heroes {
  readonly heroes = inject(HeroService).getHeroes();
}
