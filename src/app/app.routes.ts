import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LandingPageAdminComponent } from './admin/landing-page-admin/landing-page-admin.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'landing-page',
        component: LandingPageAdminComponent
      },
      {
        path: '',
        redirectTo: 'landing-page',
        pathMatch: 'full'
      }
      // Add other admin routes here
    ]
  }
];
