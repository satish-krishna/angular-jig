import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-heroes',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Heroes</h1>
      <div class="grid gap-2">
        @for (hero of heroService.getHeroes(); track hero.id) {
          <a [routerLink]="['/detail', hero.id]" class="p-4 bg-card rounded-md border border-border hover:bg-muted transition-colors">
            {{ hero.name }}
          </a>
        }
      </div>
    </div>
  `,
})
export class Heroes {
  readonly heroService = inject(HeroService);
}
