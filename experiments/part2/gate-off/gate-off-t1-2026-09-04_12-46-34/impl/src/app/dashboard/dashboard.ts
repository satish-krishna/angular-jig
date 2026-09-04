import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroService } from '../services/hero.service';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, FormsModule, HlmInputImports, HlmCardImports],
  template: `
    <div class="space-y-8 p-6">
      <section>
        <h1 class="text-3xl font-bold mb-6">Top Heroes</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (hero of topHeroes(); track hero.id) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>
                  <a [routerLink]="['/detail', hero.id]" class="hover:underline">
                    {{ hero.name }}
                  </a>
                </h3>
              </div>
            </div>
          }
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Search Heroes</h2>
        <input
          type="text"
          placeholder="Search heroes by name..."
          [(ngModel)]="searchTerm"
          hlmInput
          class="w-full max-w-sm"
        />

        @if (searchResults().length > 0) {
          <div class="mt-4 space-y-2">
            @for (hero of searchResults(); track hero.id) {
              <div class="py-2 px-4 border border-border">
                <a [routerLink]="['/detail', hero.id]" class="hover:underline">
                  {{ hero.name }}
                </a>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');
  topHeroes = signal(this.heroService.getTopHeroes(4));
  searchResults = computed(() => this.heroService.searchHeroes(this.searchTerm()));
}
