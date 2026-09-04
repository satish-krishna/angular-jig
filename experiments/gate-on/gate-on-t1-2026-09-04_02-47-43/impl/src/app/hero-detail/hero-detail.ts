import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <div>
        <a [routerLink]="['/dashboard']">Back to Dashboard</a>
      </div>
      @if (hero(); as selectedHero) {
        <h1>{{ selectedHero.name }}</h1>
        <p>ID: {{ selectedHero.id }}</p>
      } @else {
        <p>Hero not found</p>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
    }
    a {
      color: var(--primary);
      text-decoration: none;
      margin-bottom: 20px;
      display: inline-block;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private heroService = inject(HeroService);

  hero = computed(() => {
    const id = this.route.snapshot.params['id'];
    return id ? this.heroService.getHero(parseInt(id, 10)) : undefined;
  });
}
