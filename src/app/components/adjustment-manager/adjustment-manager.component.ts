import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-adjustment-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule
  ],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        padding: '0'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', [
        animate('200ms ease-in-out')
      ])
    ])
  ],
  template: `
    <div class="adjustment-manager-container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>{{ sidenavOpen ? 'menu_open' : 'menu' }}</mat-icon>
        </button>
        <span>{{ mode === 'adjustment' ? 'Adjustment Manager' : 'Report Launcher' }}</span>
        
        <!-- Toggle between adjustment and report launcher -->
        <div class="toolbar-actions">
          <button mat-button (click)="setMode('adjustment')" [class.active]="mode === 'adjustment'">Adjustment</button>
          <button mat-button (click)="setMode('report')" [class.active]="mode === 'report'">Report Launcher</button>
        </div>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" [opened]="sidenavOpen" class="adjustment-panel">
          <!-- Adjustment Panel -->
          <div class="panel-content" *ngIf="mode === 'adjustment'">    
            
            <div class="form-group">
              <label>Adjustment Type:</label>
              <div class="custom-select" (click)="toggleAdjustmentTypeDropdown()">
                <div class="select-value">{{ getAdjustmentTypeLabel() }}</div>
                <span class="select-arrow">▼</span>
              </div>
              <div class="select-dropdown" *ngIf="showAdjustmentTypeDropdown">
                <div 
                  *ngFor="let type of adjustmentTypes" 
                  class="select-option" 
                  [class.selected]="adjustmentType === type.value"
                  (click)="selectAdjustmentType(type.value)"
                >
                  {{ type.label }}
                  <span class="check-icon" *ngIf="adjustmentType === type.value">✓</span>
                </div>
              </div>
            </div>
            
            <div class="form-group" *ngIf="adjustmentType === 'required_capital'">
              <label>RC Adjustment Type:</label>
              <div class="custom-select" (click)="toggleRcAdjustmentTypeDropdown()">
                <div class="select-value">{{ getRcAdjustmentTypeLabel() }}</div>
                <span class="select-arrow">▼</span>
              </div>
              <div class="select-dropdown" *ngIf="showRcAdjustmentTypeDropdown">
                <div 
                  *ngFor="let type of rcAdjustmentTypes" 
                  class="select-option" 
                  [class.selected]="rcAdjustmentType === type.value"
                  (click)="selectRcAdjustmentType(type.value)"
                >
                  {{ type.label }}
                  <span class="check-icon" *ngIf="rcAdjustmentType === type.value">✓</span>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="btn validate-btn" (click)="validateAdjustment()">
                <div class="btn-content">
                  <span class="icon">✓</span>
                  <span class="btn-text">Validate</span>
                </div>
              </button>
              <button class="btn submit-btn" (click)="submitAdjustment()">
                <div class="btn-content">
                  <span class="icon">▶</span>
                  <span class="btn-text">Submit</span>
                </div>
              </button>
              <button class="btn cancel-btn" (click)="cancelAdjustment()">
                <div class="btn-content">
                  <span class="icon">✕</span>
                  <span class="btn-text">Cancel</span>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Report Launcher Panel -->
          <div class="panel-content report-launcher" *ngIf="mode === 'report'">
            <div class="report-actions">
              <button class="action-btn execute-btn">
                <span class="icon">▶</span>
                <span>Execute</span>
              </button>
              <button class="action-btn cancel-btn">
                <span class="icon">⊗</span>
                <span>Cancel</span>
              </button>
              <button class="action-btn view-btn">
                <span class="icon">👁</span>
                <span>View</span>
              </button>
            </div>
            
            <!-- Collapsible Panels -->
            <div class="report-accordion">
              <!-- Select Report Panel -->
              <div class="accordion-section" [class.active]="activePanel === 'select'">
                <div class="accordion-header" (click)="togglePanel('select')">
                  <span>Select report</span>
                </div>
                <div class="accordion-content" [@expandCollapse]="activePanel === 'select' ? 'expanded' : 'collapsed'">
                  <div class="select-report-content">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Repository:</label>
                        <div class="custom-select">
                          <div class="select-value">Required Capital</div>
                          <span class="select-arrow">▼</span>
                        </div>
                      </div>
                      <div class="form-group">
                        <label>Environment:</label>
                        <div class="custom-select">
                          <div class="select-value">UAT</div>
                          <span class="select-arrow">▼</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="report-list-header">
                      Select Report
                    </div>
                    
                    <div class="report-list">
                      <!-- Report list will be added in the next step -->
                      <div class="placeholder-text">Report list will be displayed here</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Define Parameters Panel -->
              <div class="accordion-section" [class.active]="activePanel === 'parameters'">
                <div class="accordion-header" (click)="togglePanel('parameters')">
                  <span>Define parameters</span>
                </div>
                <div class="accordion-content" [@expandCollapse]="activePanel === 'parameters' ? 'expanded' : 'collapsed'">
                  <div class="parameters-content">
                    <div class="placeholder-text">Parameter configuration will be displayed here</div>
                  </div>
                </div>
              </div>
              
              <!-- Additional Information Panel -->
              <div class="accordion-section" [class.active]="activePanel === 'additional'">
                <div class="accordion-header" (click)="togglePanel('additional')">
                  <span>Additional information</span>
                </div>
                <div class="accordion-content" [@expandCollapse]="activePanel === 'additional' ? 'expanded' : 'collapsed'">
                  <div class="additional-content">
                    <div class="placeholder-text">Additional information will be displayed here</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-sidenav>
        
        <mat-sidenav-content class="content">
          <div class="toggle-button-container" *ngIf="!sidenavOpen">
            <button mat-mini-fab color="primary" (click)="toggleSidenav()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
          <div class="grid-container">
            <ag-grid-angular
              class="ag-theme-alpine"
              [rowData]="rowData"
              [columnDefs]="columnDefs"
              [defaultColDef]="defaultColDef"
              [pagination]="true"
              [paginationPageSize]="10"
              [modules]="modules"
              [editType]="'fullRow'"
              (gridReady)="onGridReady($event)"
            >
            </ag-grid-angular>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .adjustment-manager-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background-color: #f0f2f5;
    }
    
    .toolbar {
      background-color: var(--primary-blue);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
      display: flex;
      justify-content: space-between;
    }
    
    .toolbar-actions {
      display: flex;
      gap: 8px;
      
      button {
        color: white;
        opacity: 0.7;
        
        &.active {
          opacity: 1;
          font-weight: 500;
          border-bottom: 2px solid white;
        }
      }
    }
    
    .sidenav-container {
      flex: 1;
      background-color: transparent;
      border: none;
    }
    
    .adjustment-panel {
      width: 23rem;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      transition: width 0.3s ease;
    }
    
    .panel-content {
      padding: 10px;
    }
    
    .form-group {
      margin-bottom: 24px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 16px;
        color: #333;
      }
      
      .custom-select {
        position: relative;
        width: 92%;
        height: 40px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: pointer;
      }
      
      .select-value {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .select-arrow {
        font-size: 12px;
        color: #666;
      }
      
      .select-dropdown {
        position: absolute;
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        z-index: 100;
        margin-top: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .select-option {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .select-option:nth-child(odd) {
        background-color: #f0f0f0;
      }
      
      .select-option:hover {
        background-color: #e8f0fe;
      }
      
      .select-option.selected {
        background-color: #e8f0fe;
      }
      
      .check-icon {
        font-weight: bold;
        color: #4a69bd;
      }
    }
    
    /* Report Launcher Styles */
    .report-launcher {
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    
    .report-actions {
      display: flex;
      gap: 8px;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f5f5f5;
      cursor: pointer;
      
      &:hover {
        background-color: #e8f0fe;
      }
      
      .icon {
        font-size: 16px;
      }
    }
    
    .execute-btn {
      .icon {
        color: green;
      }
    }
    
    .cancel-btn {
      .icon {
        color: red;
      }
    }
    
    .view-btn {
      .icon {
        color: blue;
      }
    }
    
    .report-accordion {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .accordion-section {
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      
      &.active {
        .accordion-header {
          background-color: #f5a623;
          color: white;
        }
      }
    }
    
    .accordion-header {
      padding: 12px 16px;
      background-color: #e0e0e0;
      cursor: pointer;
      font-weight: 500;
      
      &:hover {
        background-color: #d0d0d0;
      }
    }
    
    .accordion-content {
      background-color: #f8f9fa;
      padding: 16px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      
      .form-group {
        flex: 1;
      }
    }
    
    .report-list-header {
      font-weight: 500;
      margin-bottom: 8px;
      padding: 8px;
      background-color: #e0e0e0;
    }
    
    .report-list {
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      height: 300px;
      overflow-y: auto;
    }
    
    .placeholder-text {
      padding: 16px;
      color: #666;
      font-style: italic;
      text-align: center;
    }
    
    .action-buttons {
      display: flex;
      flex-direction: row;
      gap: 8px;
      margin-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding-top: 16px;
    }
    
    .btn {
      display: block;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: #f5f5f5;
      color: #333;
      flex: 1;
      height: 70px;
      
      .btn-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      
      .icon {
        font-size: 24px;
        margin-bottom: 6px;
        display: block;
      }
      
      .btn-text {
        font-size: 14px;
      }
      
      &:hover {
        opacity: 0.9;
      }
    }
    
    .validate-btn {
      background-color: #e8f5e9;
      color: #333;
      
      .icon {
        color: #4caf50;
      }
    }
    
    .submit-btn {
      background-color: #f5f5f5;
      color: #333;
      
      .icon {
        color: #2196f3;
      }
    }
    
    .cancel-btn {
      background-color: #ffebee;
      color: #333;
      
      .icon {
        color: #f44336;
      }
    }
    
    .content {
      background-color: transparent;
      position: relative;
      transition: margin-left 0.3s ease;
    }
    
    .toggle-button-container {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      
      button {
        background-color: var(--primary-blue);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .grid-container {
      height:100%;
      width: 100%;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      color: #4a69bd;
      font-weight: 500;
      border-bottom: 1px solid rgba(74, 105, 189, 0.3);
      padding-bottom: 12px;
      font-size: 24px;
    }
    
    ag-grid-angular {
      height: 100%;
      width: 100%;
    }
    
    ::ng-deep {
      .mat-mdc-select-trigger {
        height: 40px;
        padding: 8px 12px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .mat-mdc-select-value {
        color: #333;
      }
      
      .mat-mdc-select-arrow {
        color: #333;
      }
      
      .mat-mdc-form-field-infix {
        padding: 0 !important;
        border-top: 0 !important;
      }
      
      .mat-mdc-form-field-underline {
        display: none;
      }
      
      .mat-mdc-form-field-wrapper {
        padding: 0;
      }
    }
  `]
})
export class AdjustmentManagerComponent implements OnInit {
  adjustmentType: string = 'required_capital';
  rcAdjustmentType: string = 'reverse';
  sidenavOpen: boolean = true;
  showAdjustmentTypeDropdown: boolean = false;
  showRcAdjustmentTypeDropdown: boolean = false;
  
  // Report launcher properties
  mode: 'adjustment' | 'report' = 'adjustment';
  activePanel: string = 'select'; // Default active panel
  
  adjustmentTypes = [
    { value: 'required_capital', label: 'Required Capital Adjustment' },
    { value: 'regulatory', label: 'Regulatory Adjustment' },
    { value: 'manual', label: 'Manual Adjustment' }
  ];
  
  rcAdjustmentTypes = [
    { value: 'reverse', label: 'Reverse RC Adjustment' },
    { value: 'standard', label: 'Standard RC Adjustment' },
    { value: 'special', label: 'Special RC Adjustment' }
  ];
  
  private gridApi!: GridApi;
  modules = [ClientSideRowModelModule];
  
  rowData: any[] = [];
  
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 100 },
    { field: 'account', headerName: 'Account', sortable: true, filter: true, editable: true },
    { field: 'amount', headerName: 'Amount', sortable: true, filter: true, editable: true, type: 'numericColumn' },
    { field: 'currency', headerName: 'Currency', sortable: true, filter: true, editable: true },
    { field: 'date', headerName: 'Date', sortable: true, filter: true, editable: true },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, editable: true }
  ];
  
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true
  };
  
  constructor() {}
  
  ngOnInit(): void {
    // Load sample data
    this.loadSampleData();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('.form-group')) {
        this.showAdjustmentTypeDropdown = false;
        this.showRcAdjustmentTypeDropdown = false;
      }
    });
  }
  
  setMode(mode: 'adjustment' | 'report'): void {
    this.mode = mode;
    
    if (mode === 'report') {
      // Set the default active panel for report launcher
      this.activePanel = 'select';
    }
  }
  
  togglePanel(panel: string): void {
    this.activePanel = this.activePanel === panel ? '' : panel;
  }
  
  getAdjustmentTypeLabel(): string {
    const type = this.adjustmentTypes.find(t => t.value === this.adjustmentType);
    return type ? type.label : '';
  }
  
  getRcAdjustmentTypeLabel(): string {
    const type = this.rcAdjustmentTypes.find(t => t.value === this.rcAdjustmentType);
    return type ? type.label : '';
  }
  
  toggleAdjustmentTypeDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAdjustmentTypeDropdown = !this.showAdjustmentTypeDropdown;
    this.showRcAdjustmentTypeDropdown = false;
  }
  
  toggleRcAdjustmentTypeDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showRcAdjustmentTypeDropdown = !this.showRcAdjustmentTypeDropdown;
    this.showAdjustmentTypeDropdown = false;
  }
  
  selectAdjustmentType(value: string): void {
    this.adjustmentType = value;
    this.showAdjustmentTypeDropdown = false;
  }
  
  selectRcAdjustmentType(value: string): void {
    this.rcAdjustmentType = value;
    this.showRcAdjustmentTypeDropdown = false;
  }
  
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  
  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
    // Resize grid after sidenav toggle to ensure proper layout
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }, 300);
  }
  
  loadSampleData() {
    this.rowData = [
      { id: 1, account: 'AC001', amount: 5000, currency: 'USD', date: '2023-05-15', status: 'Pending' },
      { id: 2, account: 'AC002', amount: 7500, currency: 'EUR', date: '2023-05-16', status: 'Approved' },
      { id: 3, account: 'AC003', amount: 3200, currency: 'GBP', date: '2023-05-17', status: 'Rejected' },
      { id: 4, account: 'AC004', amount: 9800, currency: 'USD', date: '2023-05-18', status: 'Pending' },
      { id: 5, account: 'AC005', amount: 4300, currency: 'JPY', date: '2023-05-19', status: 'Approved' }
    ];
  }
  
  validateAdjustment() {
    console.log('Validating adjustment...');
    // Implement validation logic here
    alert('Adjustment validated successfully!');
  }
  
  submitAdjustment() {
    console.log('Submitting adjustment...');
    // Implement submission logic here
    alert('Adjustment submitted!');
  }
  
  cancelAdjustment() {
    console.log('Cancelling adjustment...');
    // Implement cancellation logic here
    this.adjustmentType = 'required_capital';
    this.rcAdjustmentType = 'reverse';
    alert('Adjustment cancelled!');
  }
} 