import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LandingPageAdminComponent } from './admin/landing-page-admin/landing-page-admin.component';
import { SquadDetailsEditComponent } from './admin/squad-details-edit/squad-details-edit.component';
import { ToolsManagementComponent } from './admin/tools-management/tools-management.component';
import { ToolsComponent } from './tools/tools.component';

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
        path: 'squad-details',
        component: SquadDetailsEditComponent
      },
      {
        path: 'tools',
        component: ToolsManagementComponent
      },
      {
        path: '',
        redirectTo: 'landing-page',
        pathMatch: 'full'
      }
      // Add other admin routes here
    ]
  },
  {
    path: 'tools',
    component: ToolsComponent
  }
];
