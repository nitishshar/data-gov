import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LandingPageAdminComponent } from './admin/landing-page-admin/landing-page-admin.component';
import { SquadDetailsEditComponent } from './admin/squad-details-edit/squad-details-edit.component';
import { ToolsComponent } from './tools/tools.component';
import { ToolsEditComponent } from './admin/tools-edit/tools-edit.component';
import { ProgramsComponent } from './programs/programs.component';
import { ProgramsEditComponent } from './admin/programs-edit/programs-edit.component';
import { AccomplishmentsComponent } from './accomplishments/accomplishments.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'accomplishments',
    component: AccomplishmentsComponent
  },
  {
    path: 'accomplishments/:id',
    component: AccomplishmentsComponent
  },
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
        component: ToolsEditComponent
      },
      {
        path: 'programs',
        component: ProgramsEditComponent
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
  },
  {
    path: 'programs',
    component: ProgramsComponent
  }
];
