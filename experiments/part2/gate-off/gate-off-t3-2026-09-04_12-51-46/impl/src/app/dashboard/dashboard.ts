import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink, HlmInputImports],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');
  topHeroes = computed(() => this.heroService.getTopHeroes(4));
  searchResults = computed(() => {
    const term = this.searchTerm();
    return term.trim() ? this.heroService.searchHeroes(term) : [];
  });

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
}
