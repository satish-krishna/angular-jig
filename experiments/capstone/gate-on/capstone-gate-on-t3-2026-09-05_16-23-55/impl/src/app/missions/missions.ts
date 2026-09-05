import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Missions</h1>
        <p class="text-sm text-muted-foreground">Active and completed operations</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-6">
        <p class="text-muted-foreground">Missions module - Coming soon</p>
      </div>
    </div>
  `,
})
export class Missions {}
