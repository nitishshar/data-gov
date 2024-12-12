import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="admin-layout">
      <nav class="admin-sidenav">
        <div class="sidenav-header">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Admin Dashboard</span>
        </div>
        
        <div class="nav-list">
          <a *ngFor="let item of menuItems" 
             [routerLink]="[item.path]" 
             routerLinkActive="active-link"
             class="nav-item">
            <mat-icon>{{item.icon}}</mat-icon>
            <span>{{item.label}}</span>
          </a>
        </div>
      </nav>

      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      background: #f5f5f5;
    }

    .admin-sidenav {
      width: 250px;
      background: #fff;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
    }

    .sidenav-header {
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #1976d2;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      span {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .nav-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      height: 48px;
      padding: 0 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(0, 0, 0, 0.87);
      text-decoration: none;
      transition: background-color 0.3s;

      mat-icon {
        color: rgba(0, 0, 0, 0.54);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      &.active-link {
        background: #e3f2fd;
        color: #1976d2;

        mat-icon {
          color: #1976d2;
        }
      }
    }

    .admin-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
  `]
})
export class AdminComponent {
  menuItems = [
    { path: './landing-page', icon: 'home', label: 'Landing Page' },
    { path: './squad-details', icon: 'groups', label: 'Squad Details' },
    { path: './tools', icon: 'build', label: 'Tools Management' },
    { path: './programs', icon: 'school', label: 'Programs' },
    { path: './members', icon: 'person', label: 'Members' },
    { path: './settings', icon: 'settings', label: 'Settings' }
  ];
} 