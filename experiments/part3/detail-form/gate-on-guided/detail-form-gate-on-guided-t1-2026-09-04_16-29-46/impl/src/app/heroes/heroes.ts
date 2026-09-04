import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-heroes',
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-[600px] px-4 py-8">
      <h1 class="mb-8 text-3xl font-bold">Heroes</h1>
      <div class="flex flex-col gap-2">
        @for (hero of heroService.getHeroes(); track hero.id) {
          <a [routerLink]="['/detail', hero.id]" class="underline text-primary">
            {{ hero.name }}
          </a>
        }
      </div>
    </div>
  `,
})
export class Heroes {
  heroService = inject(HeroService);
}
