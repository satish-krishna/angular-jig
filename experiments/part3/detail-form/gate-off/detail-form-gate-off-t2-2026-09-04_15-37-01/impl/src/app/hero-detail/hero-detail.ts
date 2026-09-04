import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroService, type Hero } from '../heroes/hero.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-hero-detail',
  imports: [FormsModule, HlmCardImports, HlmInputImports, HlmButtonImports],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private heroService = inject(HeroService);

  hero = signal<Hero | undefined>(undefined);
  editedName = signal('');

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const loadedHero = this.heroService.getHero(id);
      this.hero.set(loadedHero);
      if (loadedHero) {
        this.editedName.set(loadedHero.name);
      }
    });
  }

  onSave(): void {
    if (this.hero() && this.editedName()) {
      this.heroService.updateHero(this.hero()!.id, this.editedName());
      this.hero.set({ ...this.hero()!, name: this.editedName() });
      this.router.navigate(['/heroes']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
