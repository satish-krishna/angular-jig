import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../hero.service';
import { HlmInputImports } from '../../../libs/ui/input/src';
import { HlmCardImports } from '../../../libs/ui/card/src';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HlmInputImports, HlmCardImports],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');
  allHeroes = this.heroService.getHeroes();

  topHeroes = computed(() => this.allHeroes.slice(0, 4));

  searchResults = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return [];
    return this.allHeroes.filter(h => h.name.toLowerCase().includes(term));
  });
}
