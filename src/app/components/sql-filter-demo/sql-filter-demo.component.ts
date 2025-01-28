import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SqlFilterBuilderComponent } from '../sql-filter-builder/sql-filter-builder.component';
import { FilterConfig } from '../../models/sql-filter.model';

@Component({
  selector: 'app-sql-filter-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    SqlFilterBuilderComponent
  ],
  template: `
    <div class="demo-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>SQL Filter Builder Demo</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <app-sql-filter-builder
            [config]="filterConfig"
            (filterChange)="onFilterChange($event)">
          </app-sql-filter-builder>

          <div class="generated-sql" *ngIf="generatedSql">
            <h3>Generated SQL:</h3>
            <pre>{{ generatedSql }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .generated-sql {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;

      h3 {
        margin: 0 0 1rem;
        color: #333;
      }

      pre {
        margin: 0;
        padding: 1rem;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #ddd;
        overflow-x: auto;
      }
    }
  `]
})
export class SqlFilterDemoComponent {
  generatedSql = '';

  // Example configuration
  filterConfig: FilterConfig = {
    operands: [
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text'
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number'
      },
      {
        name: 'birth_date',
        label: 'Birth Date',
        type: 'date'
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' }
        ]
      },
      {
        name: 'roles',
        label: 'Roles',
        type: 'multiselect',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' }
        ]
      }
    ],
    operators: [
      {
        symbol: '=',
        label: 'Equals',
        applicableTypes: ['text', 'number', 'date']
      },
      {
        symbol: '!=',
        label: 'Not Equals',
        applicableTypes: ['text', 'number', 'date']
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
        supportsPercentage: true,
        applicableTypes: ['text']
      },
      {
        symbol: 'IN',
        label: 'In',
        applicableTypes: ['text', 'number']
      }
    ],
    logicalOperators: [
      { value: 'AND', label: 'AND' },
      { value: 'OR', label: 'OR' }
    ]
  };

  onFilterChange(sql: string) {
    this.generatedSql = sql;
  }
} 