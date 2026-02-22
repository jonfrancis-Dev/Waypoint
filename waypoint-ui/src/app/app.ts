import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Waypoint</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/transactions">Transactions</a>
      <a mat-button routerLink="/transactions/upload">Upload</a>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .content { padding: 24px; max-width: 1200px; margin: 0 auto; }
  `],
})
export class App {
  title = 'Waypoint';
}
