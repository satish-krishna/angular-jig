import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-threats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Threats</h1>
        <p class="text-sm text-muted-foreground">Known and potential threats</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-6">
        <p class="text-muted-foreground">Threats module - Coming soon</p>
      </div>
    </div>
  `,
})
export class Threats {}
