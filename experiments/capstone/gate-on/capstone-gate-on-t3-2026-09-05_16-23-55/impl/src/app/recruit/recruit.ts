import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Recruit</h1>
        <p class="text-sm text-muted-foreground">Add new heroes to the roster</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-6">
        <p class="text-muted-foreground">Recruit module - Coming soon</p>
      </div>
    </div>
  `,
})
export class Recruit {}
