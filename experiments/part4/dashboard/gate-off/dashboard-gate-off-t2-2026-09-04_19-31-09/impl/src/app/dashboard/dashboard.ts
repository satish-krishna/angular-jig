import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { HlmInput } from '../../../libs/ui/input/src';
import { HeroService } from '../hero.service';
import { searchSchema, type SearchModel } from './search.schema';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInput],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <input
          type="text"
          hlmInput
          placeholder="Search heroes..."
          [formField]="searchForm.searchTerm"
        />
        @if (searchResults().length > 0) {
          <nav class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <a [routerLink]="['/detail', hero.id]" class="search-result-link">
                {{ hero.name }}
              </a>
            }
          </nav>
        }
      </div>

      <div class="top-heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <div class="hero-card">
              <a [routerLink]="['/detail', hero.id]">
                <div class="hero-name">{{ hero.name }}</div>
                <div class="hero-id">ID: {{ hero.id }}</div>
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);
  private model = signal<SearchModel>({ searchTerm: '' });
  protected readonly searchForm = form(this.model, (path) =>
    validateStandardSchema(path, searchSchema)
  );
  protected readonly topHeroes = computed(() => this.heroService.getTopHeroes(4));
  protected readonly searchResults = computed(() =>
    this.heroService.searchHeroes(this.model().searchTerm)
  );
}
