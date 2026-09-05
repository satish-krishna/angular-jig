import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-threats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 flex flex-col overflow-auto bg-background">
      <!-- Page Header -->
      <div class="px-6 py-6 border-b border-border bg-background">
        <h1 class="text-3xl font-bold text-foreground mb-1">Threats</h1>
        <p class="text-sm text-muted-foreground">Monitor active threats and incident status</p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        <div class="px-6 py-6">
          <div class="bg-card border border-border rounded-lg p-6 shadow-sm text-center">
            <p class="text-muted-foreground">Threat monitoring system coming soon</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `,
  ],
})
export class Threats {}
