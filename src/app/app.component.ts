import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { ConfigBuilderComponent } from './config-builder/config-builder.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SquadDetailsComponent } from './squad-details/squad-details.component';
import { SqlFilterBuilderComponent } from './components/sql-filter-builder/sql-filter-builder.component';
import { FilterConfig, FilterOperand, AgGridCompositeFilterModel } from './models/sql-filter.model';
import { Observable, map } from 'rxjs';
import { MockDataService } from './services/mock-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormBuilderComponent, ConfigBuilderComponent, LandingPageComponent, SquadDetailsComponent, SqlFilterBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'data-governance';
  squadData: any = null;

  filterConfig: FilterConfig = {
    theme: 'legacy',
    operands: [
      {
        name: 'division',
        label: 'Division',
        type: 'text',
        optionsConfig: {
          url: '/api/divisions',
          method: 'GET',
          searchParam: 'search'
        }
      },
      {
        name: 'cost_center',
        label: 'Cost Center',
        type: 'select',
        optionsConfig: {
          url: '/api/cost-centers',
          method: 'GET',
          searchParam: 'search'
        }
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text'
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'text'
      },
      {
        name: 'headcount',
        label: 'Headcount',
        type: 'number'
      },
      {
        name: 'budget',
        label: 'Budget',
        type: 'number'
      },
      {
        name: 'reportingDate',
        label: 'Reporting Date',
        type: 'date'
      },
      {
        name: 'manager',
        label: 'Manager',
        type: 'text',
        optionsConfig: {
          url: '/api/managers',
          method: 'GET',
          searchParam: 'search'
        }
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        optionsConfig: {
          url: '/api/locations',
          method: 'GET',
          searchParam: 'search'
        }
      },
      {
        name: 'project_status',
        label: 'Project Status',
        type: 'select',
        optionsConfig: {
          url: '/api/project-statuses',
          staticOptions: [
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        }
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        optionsConfig: {
          url: '/api/statuses',
          searchParam: 'query',
          method: 'GET'
        }
      },
      {
        name: 'user',
        label: 'User',
        type: 'autocomplete',
        optionsConfig: {
          url: '/api/users',
          searchParam: 'search',
          method: 'POST',
          valueField: 'id',
          labelField: 'name'
        }
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        optionsConfig: {
          url: '/api/roles',
          staticOptions: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
            { value: 'guest', label: 'Guest' }
          ]
        }
      }
    ],
    operators: [
      {
        symbol: '=',
        label: 'Equals',
        applicableTypes: ['text', 'number', 'date', 'select']
      },
      {
        symbol: '!=',
        label: 'Not Equals',
        applicableTypes: ['text', 'number', 'date', 'select']
      },
      {
        symbol: '>',
        label: 'Greater Than',
        applicableTypes: ['number', 'date']
      },
      {
        symbol: '>=',
        label: 'Greater Than or Equal',
        applicableTypes: ['number', 'date']
      },
      {
        symbol: '<',
        label: 'Less Than',
        applicableTypes: ['number', 'date']
      },
      {
        symbol: '<=',
        label: 'Less Than or Equal',
        applicableTypes: ['number', 'date']
      },
      {
        symbol: 'LIKE',
        label: 'Contains',
        applicableTypes: ['text', 'autocomplete'],
        percentageSupport: true
      },
      {
        symbol: 'NOT LIKE',
        label: 'Does Not Contain',
        applicableTypes: ['text', 'autocomplete'],
        percentageSupport: true
      },
      {
        symbol: 'STARTS WITH',
        label: 'Starts With',
        applicableTypes: ['text', 'autocomplete'],
        percentageSupport: true
      },
      {
        symbol: 'ENDS WITH',
        label: 'Ends With',
        applicableTypes: ['text', 'autocomplete'],
        percentageSupport: true
      },
      {
        symbol: 'IN',
        label: 'In',
        applicableTypes: ['select', 'multiselect', 'autocomplete']
      },
      {
        symbol: 'NOT IN',
        label: 'Not In',
        applicableTypes: ['select', 'multiselect', 'autocomplete']
      }
    ],
    logicalOperators: [
      { value: 'AND', label: 'AND' },
      { value: 'OR', label: 'OR' }
    ],
    defaultEditMode: true
  };

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  onFilterChange(filter: string | AgGridCompositeFilterModel) {
    if (typeof filter === 'string') {
      // Handle SQL string
      console.log('SQL Filter:', filter);
    } else {
      // Handle ag-Grid filter model
      console.log('ag-Grid Filter:', filter);
    }
  }

  ngOnInit() {
    this.http.get('assets/sample-squad-data.json').subscribe(
      data => {
        this.squadData = data;
      },
      error => {
        console.error('Error fetching squad data:', error);
      }
    );
  }
}
