import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Settings</h1>
        <p class="text-sm text-muted-foreground">Configure the console</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-6">
        <p class="text-muted-foreground">Settings module - Coming soon</p>
      </div>
    </div>
  `,
})
export class Settings {}
