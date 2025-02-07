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
    operands: [
      {
        name: 'division',
        label: 'Division',
        type: 'text',
        optionsLoader: (search: string) => this.mockDataService.getDivisions(search).pipe(
          map(divisions => divisions.map(div => ({
            value: div,
            label: div
          })))
        )
      },
      {
        name: 'cost_center',
        label: 'Cost Center',
        type: 'select',
        optionsLoader: (search: string) => this.mockDataService.getCostCenters(search).pipe(
          map(centers => centers.map(center => ({
            value: center.id,
            label: `${center.id} - ${center.name}`
          })))
        )
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
        name: 'manager',
        label: 'Manager',
        type: 'text',
        optionsLoader: (search: string) => this.mockDataService.getManagers(search).pipe(
          map(managers => managers.map(manager => ({
            value: manager,
            label: manager
          })))
        )
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        optionsLoader: (search: string) => this.mockDataService.getLocations(search).pipe(
          map(locations => locations.map(location => ({
            value: location,
            label: location
          })))
        )
      },
      {
        name: 'project_status',
        label: 'Project Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
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
