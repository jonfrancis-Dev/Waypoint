import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Waypoint</span>
      <span class="spacer"></span>
      <a mat-button [routerLink]="['/dashboard']" routerLinkActive="active-link">Dashboard</a>
      <a mat-button [routerLink]="['/transactions']" routerLinkActive="active-link">Transactions</a>
      <a mat-button [routerLink]="['/transactions/upload']" routerLinkActive="active-link">Upload</a>
      <a mat-button [routerLink]="['/budget']" routerLinkActive="active-link">Budget</a>
      <a mat-button [routerLink]="['/credit-cards']" routerLinkActive="active-link">Credit Cards</a>
      <a mat-button [routerLink]="['/debts']" routerLinkActive="active-link">Debts</a>
      <a mat-button [routerLink]="['/debt-overview']" routerLinkActive="active-link">Debt Overview</a>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .content { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .active-link { background: rgba(255, 255, 255, 0.15); }
  `],
})
export class App {
  title = 'Waypoint';
}
