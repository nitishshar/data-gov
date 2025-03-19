import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
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
            <!-- Authorization overlay for Adjustment Panel -->
            <div class="auth-overlay" *ngIf="!isUserAuthorizedForAdjustment">
              <div class="auth-message">
                <mat-icon>lock</mat-icon>
                <span>User Is Not Authorized</span>
              </div>
            </div>
            
            <!-- Adjustment content -->
            <div [class.content-disabled]="!isUserAuthorizedForAdjustment">
              <div class="form-group">
                <label>Adjustment Type:</label>
                <select class="form-select" [(ngModel)]="adjustmentType" [disabled]="!isUserAuthorizedForAdjustment">
                  <option *ngFor="let type of adjustmentTypes" [value]="type.value">{{ type.label }}</option>
                </select>
              </div>
              
              <div class="form-group" *ngIf="adjustmentType === 'required_capital'">
                <label>RC Adjustment Type:</label>
                <select class="form-select" [(ngModel)]="rcAdjustmentType" [disabled]="!isUserAuthorizedForAdjustment">
                  <option *ngFor="let type of rcAdjustmentTypes" [value]="type.value">{{ type.label }}</option>
                </select>
              </div>
              
              <div class="action-buttons">
                <button class="btn validate-btn" (click)="validateAdjustment()" [disabled]="!isUserAuthorizedForAdjustment">
                  <div class="btn-content">
                    <span class="icon">✓</span>
                    <span class="btn-text">Validate</span>
                  </div>
                </button>
                <button class="btn submit-btn" (click)="submitAdjustment()" [disabled]="!isUserAuthorizedForAdjustment">
                  <div class="btn-content">
                    <span class="icon">▶</span>
                    <span class="btn-text">Submit</span>
                  </div>
                </button>
                <button class="btn cancel-btn" (click)="cancelAdjustment()" [disabled]="!isUserAuthorizedForAdjustment">
                  <div class="btn-content">
                    <span class="icon">✕</span>
                    <span class="btn-text">Cancel</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Report Launcher Panel -->
          <div class="panel-content report-launcher" *ngIf="mode === 'report'">
            <!-- Authorization overlay for Report Launcher Panel -->
            <div class="auth-overlay" *ngIf="!isUserAuthorizedForReportLauncher">
              <div class="auth-message">
                <mat-icon>lock</mat-icon>
                <span>User Is Not Authorized</span>
              </div>
            </div>
            
            <!-- Report Launcher content -->
            <div [class.content-disabled]="!isUserAuthorizedForReportLauncher">
              <div class="report-actions">
                <button class="action-btn execute-btn" [disabled]="!isUserAuthorizedForReportLauncher">
                  <span class="icon">▶</span>
                  <span>Execute</span>
                </button>
                <button class="action-btn cancel-btn" [disabled]="!isUserAuthorizedForReportLauncher">
                  <span class="icon">⊗</span>
                  <span>Cancel</span>
                </button>
                <button class="action-btn view-btn" [disabled]="!isUserAuthorizedForReportLauncher">
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
                          <select class="form-select" [(ngModel)]="repository">
                            <option *ngFor="let type of adjustmentTypes" [value]="type.value">{{ type.label }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Environment:</label>
                          <select class="form-select" [(ngModel)]="environment">
                            <option value="uat">UAT</option>
                            <option value="prod">Production</option>
                            <option value="dev">Development</option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="report-list-header">
                        Select Report
                      </div>
                      
                      <div class="report-list">
                        <!-- Capital Reports Folder -->
                        <div class="report-folder" [class.expanded]="expandedFolders.includes('capital')">
                          <div class="folder-header" (click)="toggleFolder('capital')">
                            <span class="folder-toggle">{{ expandedFolders.includes('capital') ? '▼' : '▶' }}</span>
                            <span class="folder-icon">📁</span>
                            <span class="folder-name">Capital Reports (7)</span>
                          </div>
                          <div class="folder-content" *ngIf="expandedFolders.includes('capital')">
                            <div class="report-item" *ngFor="let report of capitalReports" 
                                 [class.selected]="selectedReport === report.id"
                                 (click)="selectReport(report.id)">
                              <span class="report-icon">📊</span>
                              <span class="report-name">{{ report.name }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Investigation Folder -->
                        <div class="report-folder" [class.expanded]="expandedFolders.includes('investigation')">
                          <div class="folder-header" (click)="toggleFolder('investigation')">
                            <span class="folder-toggle">{{ expandedFolders.includes('investigation') ? '▼' : '▶' }}</span>
                            <span class="folder-icon">📁</span>
                            <span class="folder-name">Investigation</span>
                          </div>
                          <div class="folder-content" *ngIf="expandedFolders.includes('investigation')">
                            <!-- Top Movements Subfolder -->
                            <div class="report-subfolder" [class.expanded]="expandedFolders.includes('top_movements')">
                              <div class="subfolder-header" (click)="toggleFolder('top_movements'); $event.stopPropagation()">
                                <span class="folder-toggle">{{ expandedFolders.includes('top_movements') ? '▼' : '▶' }}</span>
                                <span class="folder-icon">📁</span>
                                <span class="folder-name">Top Movements (6)</span>
                              </div>
                              <div class="subfolder-content" *ngIf="expandedFolders.includes('top_movements')">
                                <!-- Top Movements reports would go here -->
                              </div>
                            </div>
                            
                            <!-- Top Positions Subfolder -->
                            <div class="report-subfolder" [class.expanded]="expandedFolders.includes('top_positions')">
                              <div class="subfolder-header" (click)="toggleFolder('top_positions'); $event.stopPropagation()">
                                <span class="folder-toggle">{{ expandedFolders.includes('top_positions') ? '▼' : '▶' }}</span>
                                <span class="folder-icon">📁</span>
                                <span class="folder-name">Top Positions (4)</span>
                              </div>
                              <div class="subfolder-content" *ngIf="expandedFolders.includes('top_positions')">
                                <div class="report-item" *ngFor="let report of topPositionsReports" 
                                     [class.selected]="selectedReport === report.id"
                                     (click)="selectReport(report.id)">
                                  <span class="report-icon">📊</span>
                                  <span class="report-name">{{ report.name }}</span>
                                </div>
                              </div>
                            </div>
                            
                            <!-- Other Subfolder -->
                            <div class="report-subfolder" [class.expanded]="expandedFolders.includes('other')">
                              <div class="subfolder-header" (click)="toggleFolder('other'); $event.stopPropagation()">
                                <span class="folder-toggle">{{ expandedFolders.includes('other') ? '▼' : '▶' }}</span>
                                <span class="folder-icon">📁</span>
                                <span class="folder-name">Other (5)</span>
                              </div>
                              <div class="subfolder-content" *ngIf="expandedFolders.includes('other')">
                                <!-- Other reports would go here -->
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- BU Allocation Folder -->
                        <div class="report-folder" [class.expanded]="expandedFolders.includes('bu')">
                          <div class="folder-header" (click)="toggleFolder('bu')">
                            <span class="folder-toggle">{{ expandedFolders.includes('bu') ? '▼' : '▶' }}</span>
                            <span class="folder-icon">📁</span>
                            <span class="folder-name">BU allocation (10)</span>
                          </div>
                          <div class="folder-content" *ngIf="expandedFolders.includes('bu')">
                            <div class="report-item" *ngFor="let report of buReports" 
                                 [class.selected]="selectedReport === report.id"
                                 (click)="selectReport(report.id)">
                              <span class="report-icon">📊</span>
                              <span class="report-name">{{ report.name }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- My Reports Folder -->
                        <div class="report-folder" [class.expanded]="expandedFolders.includes('my')">
                          <div class="folder-header" (click)="toggleFolder('my')">
                            <span class="folder-toggle">{{ expandedFolders.includes('my') ? '▼' : '▶' }}</span>
                            <span class="folder-icon">📁</span>
                            <span class="folder-name">My Reports</span>
                          </div>
                          <div class="folder-content" *ngIf="expandedFolders.includes('my')">
                            <!-- My reports would go here -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Define Parameters Panel -->
                <div class="accordion-section" [class.active]="activePanel === 'parameters'">
                  <div class="accordion-header" (click)="togglePanel('parameters')">
                    <span>Define parameters</span>
                  </div>
                  <div class="accordion-content parameters-content" [@expandCollapse]="activePanel === 'parameters' ? 'expanded' : 'collapsed'">
                    <!-- Selected Report -->
                    <div class="form-group compact" *ngIf="paramConfig.showSelectedReport">
                      <label>Selected report:</label>
                      <div class="readonly-field">
                        {{ getSelectedReportName() }}
                      </div>
                    </div>
                    
                    <!-- Reporting Dates Section -->
                    <div class="dates-section">
                      <!-- Reporting Date 1 -->
                      <div class="date-row" *ngIf="paramConfig.showReportingDate1">
                        <div class="date-group">
                          <label>Reporting Date 1</label>
                          <div class="date-input-container">
                            <input 
                              type="date" 
                              class="form-input date-native" 
                              [(ngModel)]="reportParams.reportingDate1String"
                              [min]="dateConfig.minDate1String"
                              [max]="dateConfig.maxDate1String"
                              [disabled]="dateConfig.disableDate1"
                              (change)="onDateChange('reportingDate1')"
                            >
                            <button class="calendar-button">
                              <span class="calendar-icon">15</span>
                            </button>
                          </div>
                        </div>
                        
                        <div class="version-group" *ngIf="paramConfig.showVersion1">
                          <label>Version</label>
                          <select class="form-select" [(ngModel)]="reportParams.version1">
                            <option value="Flash">Flash</option>
                            <option value="Final">Final</option>
                            <option value="Preliminary">Preliminary</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </div>
                      </div>
                      
                      <!-- Reporting Date 2 -->
                      <div class="date-row" *ngIf="paramConfig.showReportingDate2">
                        <div class="date-group">
                          <label>Reporting Date 2</label>
                          <div class="date-input-container">
                            <input 
                              type="date" 
                              class="form-input date-native" 
                              [(ngModel)]="reportParams.reportingDate2String"
                              [min]="dateConfig.minDate2String"
                              [max]="dateConfig.maxDate2String"
                              [disabled]="dateConfig.disableDate2"
                              (change)="onDateChange('reportingDate2')"
                            >
                            <button class="calendar-button">
                              <span class="calendar-icon">15</span>
                            </button>
                          </div>
                        </div>
                        
                        <div class="version-group" *ngIf="paramConfig.showVersion2">
                          <label>Version</label>
                          <select class="form-select" [(ngModel)]="reportParams.version2">
                            <option value="Flash">Flash</option>
                            <option value="Final">Final</option>
                            <option value="Preliminary">Preliminary</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </div>
                      </div>
                      
                      <!-- Reporting Date 3 -->
                      <div class="date-row" *ngIf="paramConfig.showReportingDate3">
                        <div class="date-group">
                          <label>Reporting Date 3</label>
                          <div class="date-input-container">
                            <input 
                              type="date" 
                              class="form-input date-native" 
                              [(ngModel)]="reportParams.reportingDate3String"
                              [min]="dateConfig.minDate3String"
                              [max]="dateConfig.maxDate3String"
                              [disabled]="dateConfig.disableDate3"
                              (change)="onDateChange('reportingDate3')"
                            >
                            <button class="calendar-button">
                              <span class="calendar-icon">15</span>
                            </button>
                          </div>
                        </div>
                        
                        <div class="version-group" *ngIf="paramConfig.showVersion3">
                          <label>Version</label>
                          <select class="form-select" [(ngModel)]="reportParams.version3">
                            <option value="Flash">Flash</option>
                            <option value="Final">Final</option>
                            <option value="Preliminary">Preliminary</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Business Area and Region Section -->
                    <div class="business-section">
                      <!-- Business Area -->
                      <div class="form-group compact" *ngIf="paramConfig.showBusinessArea">
                        <label>Business Area</label>
                        <select class="form-select" [(ngModel)]="reportParams.businessArea">
                          <option value="MORGAN STANLEY BUS UNITS">MORGAN STANLEY BUS UNITS</option>
                          <option value="INSTITUTIONAL SECURITIES">INSTITUTIONAL SECURITIES</option>
                          <option value="WEALTH MANAGEMENT">WEALTH MANAGEMENT</option>
                          <option value="INVESTMENT MANAGEMENT">INVESTMENT MANAGEMENT</option>
                        </select>
                      </div>
                      
                      <!-- Region -->
                      <div class="form-group compact" *ngIf="paramConfig.showRegion">
                        <label>Region</label>
                        <select class="form-select" [(ngModel)]="reportParams.region">
                          <option value="GLOBAL">GLOBAL</option>
                          <option value="AMERICAS">AMERICAS</option>
                          <option value="EMEA">EMEA</option>
                          <option value="ASIA">ASIA</option>
                        </select>
                      </div>
                    </div>
                    
                    <!-- Report Options -->
                    <div class="report-options-panel compact" *ngIf="paramConfig.showReportOptions">
                      <div class="report-options-header">Report Options</div>
                      <div class="report-options-content">
                        <div class="checkbox-group">
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="reportParams.includeThirdReportingDate">
                            <span class="checkbox-label">Include Third Reporting Date</span>
                          </label>
                          
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="reportParams.includeBrmReclass">
                            <span class="checkbox-label">Include BRM Reclass</span>
                          </label>
                          
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="reportParams.historicalStructure">
                            <span class="checkbox-label">Historical Structure</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <!-- JV View -->
                    <div class="form-group compact" *ngIf="paramConfig.showJvView">
                      <label>JV View</label>
                      <select class="form-select" [(ngModel)]="reportParams.jvView">
                        <option value="Post-JV">Post-JV</option>
                        <option value="Pre-JV">Pre-JV</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    
                    <!-- Output Options -->
                    <div class="output-options-panel compact" *ngIf="paramConfig.showOutputOptions">
                      <div class="output-options-header">Output options</div>
                      <div class="output-options-content">
                        <div class="output-options-row">
                          <div class="form-group no-margin">
                            <label>Display in</label>
                            <select class="form-select" [(ngModel)]="reportParams.displayIn">
                              <option value="Millions">Millions</option>
                              <option value="Thousands">Thousands</option>
                              <option value="Billions">Billions</option>
                              <option value="Actual">Actual</option>
                            </select>
                          </div>
                          
                          <div class="form-group no-margin">
                            <label>Output format</label>
                            <select class="form-select" [(ngModel)]="reportParams.outputFormat">
                              <option value="Excel">Excel</option>
                              <option value="PDF">PDF</option>
                              <option value="CSV">CSV</option>
                              <option value="HTML">HTML</option>
                            </select>
                          </div>
                        </div>
                      </div>
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
                      <div class="info-row">
                        <div class="info-label">Version:</div>
                        <div class="info-value">{{ additionalInfo.version }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Request preparation time:</div>
                        <div class="info-value">{{ additionalInfo.requestPrepTime }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Query execution time:</div>
                        <div class="info-value">{{ additionalInfo.queryExecTime }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Build resultset time:</div>
                        <div class="info-value">{{ additionalInfo.buildResultTime }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Format output time:</div>
                        <div class="info-value">{{ additionalInfo.formatOutputTime }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Modify data time:</div>
                        <div class="info-value">{{ additionalInfo.modifyDataTime }}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="info-label">Content generation time:</div>
                        <div class="info-value">{{ additionalInfo.contentGenTime }}</div>
                      </div>
                      
                      <div class="options-section">
                        <div class="checkbox-row">
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="additionalInfo.workOffline">
                            <span class="checkbox-label">Work offline</span>
                          </label>
                          
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="additionalInfo.createMockData">
                            <span class="checkbox-label">Create mock data</span>
                          </label>
                        </div>
                        
                        <div class="checkbox-row">
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="additionalInfo.disableRedirect">
                            <span class="checkbox-label">Disable Redirect</span>
                          </label>
                        </div>
                        
                        <div class="checkbox-row">
                          <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="additionalInfo.enableQueryTrace">
                            <span class="checkbox-label">Enable query trace</span>
                          </label>
                          
                          <button class="copy-query-btn">Copy query to clipboard</button>
                        </div>
                      </div>
                      
                      <div class="query-trace-area">
                        <div class="query-trace-content">
                          <!-- Query trace content would appear here when enabled -->
                        </div>
                      </div>
                    </div>
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
      width: 25rem;
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
        width: 100%;
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
        left: 0;
        top: 100%;
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
      border: 1px solid rgba(204, 204, 204, 0.5);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      &.active {
        .accordion-header {
          background: linear-gradient(to right, rgba(245, 166, 35, 0.9), rgba(245, 166, 35, 0.7));
          color: white;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
      }
    }
    
    .accordion-header {
      padding: 12px 16px;
      background: rgba(224, 224, 224, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      &:hover {
        background: rgba(208, 208, 208, 0.8);
      }
    }
    
    .accordion-content {
      background-color: rgba(248, 249, 250, 0.9);
      padding: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
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
      background: rgba(224, 224, 224, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 4px;
    }
    
    .report-list {
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      height: 300px;
      overflow-y: auto;
      padding: 0;
    }
    
    .report-folder {
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.expanded {
        background-color: #f8f9fa;
      }
    }
    
    .folder-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
    
    .folder-toggle {
      color: #666;
      font-size: 12px;
      margin-right: 8px;
      width: 12px;
      text-align: center;
    }
    
    .folder-icon {
      margin-right: 8px;
    }
    
    .folder-name {
      font-weight: 500;
    }
    
    .folder-content {
      padding-left: 16px;
    }
    
    .report-subfolder {
      margin-left: 16px;
      
      &.expanded {
        background-color: #f8f9fa;
      }
    }
    
    .subfolder-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
    
    .subfolder-content {
      padding-left: 16px;
    }
    
    .report-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #f0f0f0;
      }
      
      &.selected {
        background-color: #e8f0fe;
      }
    }
    
    .report-icon {
      margin-right: 8px;
      color: #d32f2f;
    }
    
    .report-name {
      font-size: 14px;
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
      
      .calendar-toggle {
        margin-left: -36px;
        
        .mat-datepicker-toggle-default-icon {
          display: none;
        }
        
        .calendar-icon {
          font-size: 12px;
          font-weight: bold;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }
        
        .mat-mdc-icon-button.mat-mdc-button-base {
          width: 36px;
          height: 36px;
          padding: 0;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          border-left: none;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          
          &:hover {
            background-color: #e0e0e0;
          }
        }
      }
      
      .mat-datepicker-content {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        
        .mat-calendar {
          width: 296px !important;
          height: auto !important;
        }
      }
      
      .cdk-overlay-container {
        z-index: 1060 !important;
      }
      
      .cdk-overlay-pane {
        transform: none !important;
      }
      
      .mat-calendar-header {
        padding: 8px !important;
        background-color: #f5f5f5 !important;
      }
      
      .mat-calendar-table {
        width: 100% !important;
      }
      
      .mat-calendar-body-cell {
        height: 36px !important;
        width: 36px !important;
      }
      
      .mat-calendar-body-cell-content {
        border-radius: 50% !important;
        height: 32px !important;
        width: 32px !important;
        line-height: 32px !important;
      }
      
      .mat-calendar-body-selected {
        background-color: var(--primary-blue, #1976d2) !important;
        color: white !important;
      }
      
      .mat-calendar-body-today:not(.mat-calendar-body-selected) {
        border-color: var(--primary-blue, #1976d2) !important;
      }
    }
    
    .parameters-content {
      padding: 12px 16px;
    }
    
    .form-group.compact {
      margin-bottom: 12px;
    }
    
    .form-group.no-margin {
      margin-bottom: 0;
    }
    
    .dates-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .date-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      width: 100%;
    }
    
    .date-group {
      flex: 3;
      max-width: 65%;
      
      label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        color: #333;
      }
    }
    
    .version-group {
      flex: 2;
      min-width: 120px;
      
      label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        color: #333;
      }
    }
    
    .business-section {
      margin-bottom: 12px;
    }
    
    .input-with-options {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .custom-select {
        flex: 1;
      }
    }
    
    .date-input-container {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      
      .form-input {
        width: 100%;
        height: 36px;
        padding: 6px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        
        &.date-native {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          padding-right: 36px;
          position: relative;
          z-index: 1;
          
          &::-webkit-calendar-picker-indicator {
            opacity: 0;
            width: 36px;
            height: 36px;
            position: absolute;
            right: 0;
            top: 0;
            cursor: pointer;
            z-index: 3;
          }
        }
      }
      
      .calendar-button {
        width: 36px;
        height: 36px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-left: none;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: absolute;
        right: 0;
        z-index: 2;
        pointer-events: none;
        
        .calendar-icon {
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }
      }
    }
    
    .options-button {
      width: 24px;
      height: 36px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background-color: #e0e0e0;
      }
      
      .options-icon {
        font-size: 14px;
        color: #333;
      }
    }
    
    .report-options-panel, .output-options-panel {
      margin-bottom: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      
      &.compact {
        margin-bottom: 12px;
      }
    }
    
    .report-options-header, .output-options-header {
      padding: 8px 12px;
      background-color: #f5f5f5;
      font-weight: 500;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }
    
    .report-options-content, .output-options-content {
      padding: 10px 12px;
      background-color: #fff;
    }
    
    .output-options-row {
      display: flex;
      gap: 12px;
      
      .form-group {
        flex: 1;
      }
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      input[type="checkbox"] {
        margin-right: 8px;
        cursor: pointer;
      }
      
      .checkbox-label {
        font-size: 14px;
        color: #333;
      }
    }
    
    .custom-select {
      position: relative;
      width: 100%;
      height: 36px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      cursor: pointer;
      font-size: 14px;
      min-width: 100px;
    }
    
    .readonly-field {
      width: 100%;
      height: 36px;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f5f5f5;
      font-size: 14px;
      display: flex;
      align-items: center;
      color: #666;
    }
    
    .calendar-button {
      width: 36px;
      height: 36px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-left: none;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      
      &:hover {
        background-color: #e0e0e0;
      }
      
      .calendar-icon {
        font-size: 12px;
        font-weight: bold;
        color: #333;
      }
    }
    
    .custom-datepicker-panel {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      max-height: 80vh !important;
      overflow: auto !important;
      
      .mat-datepicker-content {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
        border-radius: 8px !important;
        
        .mat-calendar {
          width: 300px !important;
          height: auto !important;
        }
      }
    }
    
    .mat-calendar-header {
      padding: 8px 16px !important;
      background-color: #f5f5f5 !important;
      border-bottom: 1px solid #e0e0e0 !important;
      
      .mat-calendar-controls {
        margin: 0 !important;
      }
    }
    
    .mat-calendar-body {
      min-width: 280px !important;
      padding: 8px !important;
    }
    
    .mat-calendar-table {
      width: 100% !important;
    }
    
    .mat-calendar-body-cell {
      height: 36px !important;
      width: 36px !important;
    }
    
    .mat-calendar-body-cell-content {
      border-radius: 50% !important;
      height: 32px !important;
      width: 32px !important;
      line-height: 32px !important;
    }
    
    .mat-calendar-body-selected {
      background-color: var(--primary-blue, #1976d2) !important;
      color: white !important;
    }
    
    .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: var(--primary-blue, #1976d2) !important;
    }
    
    .mat-calendar-table-header th {
      font-size: 12px !important;
      font-weight: 500 !important;
      color: #666 !important;
      padding: 0 0 8px 0 !important;
    }
    
    .mat-calendar-body-label {
      font-weight: 500 !important;
      color: #333 !important;
    }
    
    .mat-calendar-period-button,
    .mat-calendar-previous-button,
    .mat-calendar-next-button {
      color: #333 !important;
    }
    
    .cdk-overlay-container {
      z-index: 1060 !important;
    }
    
    .cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
      opacity: 0.5 !important;
    }
    
    .form-select {
      width: 100%;
      height: 36px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0 10px;
      font-size: 14px;
      min-width: 100px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 16px;
      padding-right: 30px;
    }
    
    .additional-content {
      padding: 10px;
      color: #333;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 14px;
    }
    
    .info-label {
      flex: 0 0 200px;
      font-weight: normal;
    }
    
    .info-value {
      flex: 1;
    }
    
    .options-section {
      margin-top: 10px;
    }
    
    .checkbox-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
      margin-right: 20px;
      cursor: pointer;
      
      input[type="checkbox"] {
        margin-right: 8px;
        cursor: pointer;
      }
    }
    
    .copy-query-btn {
      background-color: #e0e0e0;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #d0d0d0;
      }
    }
    
    .query-trace-area {
      margin-top: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      min-height: 200px;
      background-color: #f9f9f9;
      padding: 8px;
    }
    
    .query-trace-content {
      width: 100%;
      height: 100%;
      min-height: 180px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      overflow-y: auto;
    }
    
    .auth-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      backdrop-filter: blur(2px);
    }
    
    .auth-message {
      background-color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      mat-icon {
        font-size: 32px;
        height: 32px;
        width: 32px;
        color: #d32f2f;
      }
      
      span {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
    }
    
    .content-disabled {
      opacity: 0.7;
      pointer-events: none;
      filter: grayscale(50%);
    }
    
    .panel-content {
      padding: 16px;
      position: relative;
      height: 100%;
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
  expandedFolders: string[] = ['capital', 'investigation', 'top_positions', 'bu']; // Default expanded folders
  selectedReport: string | null = null;
  
  // Authorization flags
  isUserAuthorizedForAdjustment: boolean = false;
  isUserAuthorizedForReportLauncher: boolean = true;
  
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
  
  // Report data
  capitalReports = [
    { id: 'cap1', name: 'Capital Flash' },
    { id: 'cap2', name: 'Capital Flash New' },
    { id: 'cap3', name: 'Capital Flash Metric View' },
    { id: 'cap4', name: 'Capital Flash Standard' },
    { id: 'cap5', name: 'Capital By Component' },
    { id: 'cap6', name: 'Capital By Component Standard' },
    { id: 'cap7', name: 'Supplemental Leverage Report' }
  ];
  
  topPositionsReports = [
    { id: 'pos1', name: 'Loans Top Positions' },
    { id: 'pos2', name: 'OTC Top Positions' },
    { id: 'pos3', name: 'SLB Top Positions' },
    { id: 'pos4', name: 'REPO Top Positions' }
  ];
  
  buReports = [
    { id: 'bu1', name: 'BU Variance' },
    { id: 'bu2', name: 'B3 Allocation Percent' },
    { id: 'bu3', name: 'PB FXEM Netting Groups' },
    { id: 'bu4', name: 'LGD 100%' },
    { id: 'bu5', name: 'Bu Alloc Managed View' },
    { id: 'bu6', name: 'Bu Alloc Metric View' },
    { id: 'bu7', name: 'RFM Product Totals' },
    { id: 'bu8', name: 'CVA Addon Business Variance' },
    { id: 'bu9', name: 'Trade Capital B3' },
    { id: 'bu10', name: 'Netting Group Combined' }
  ];
  
  // Report parameters
  reportParams = {
    selectedReport: 'Capital By Component Standard',
    reportingDate1: new Date('2025-01-08'),
    reportingDate1String: '2025-01-08',
    version1: 'Flash',
    reportingDate2: new Date('2025-01-07'),
    reportingDate2String: '2025-01-07',
    version2: 'Flash',
    reportingDate3: new Date('2025-01-06'),
    reportingDate3String: '2025-01-06',
    version3: 'Flash',
    businessArea: 'MORGAN STANLEY BUS UNITS',
    region: 'GLOBAL',
    includeThirdReportingDate: false,
    includeBrmReclass: true,
    historicalStructure: false,
    jvView: 'Post-JV',
    displayIn: 'Millions',
    outputFormat: 'Excel'
  };
  
  // Parameter visibility configuration
  paramConfig = {
    showSelectedReport: true,
    showReportingDate1: true,
    showVersion1: true,
    showReportingDate2: true,
    showVersion2: true,
    showReportingDate3: true,
    showVersion3: true,
    showBusinessArea: true,
    showBusinessAreaOptions: true,
    showRegion: true,
    showRegionOptions: true,
    showReportOptions: true,
    showJvView: true,
    showOutputOptions: true
  };
  
  // Date configuration with string versions for native date inputs
  dateConfig = {
    minDate1: new Date('2024-01-01'),
    minDate1String: '2024-01-01',
    maxDate1: new Date('2025-12-31'),
    maxDate1String: '2025-12-31',
    disableDate1: false,
    minDate2: new Date('2024-01-01'),
    minDate2String: '2024-01-01',
    maxDate2: new Date('2025-12-31'),
    maxDate2String: '2025-12-31',
    disableDate2: false,
    minDate3: new Date('2024-01-01'),
    minDate3String: '2024-01-01',
    maxDate3: new Date('2025-12-31'),
    maxDate3String: '2025-12-31',
    disableDate3: false
  };
  
  repository: string = 'required_capital';
  environment: string = 'uat';
  
  additionalInfo = {
    version: '1.0.1.4',
    requestPrepTime: '',
    queryExecTime: '',
    buildResultTime: '',
    formatOutputTime: '',
    modifyDataTime: '',
    contentGenTime: '',
    workOffline: false,
    createMockData: false,
    disableRedirect: false,
    enableQueryTrace: false
  };
  
  constructor() {}
  
  ngOnInit(): void {
    // Load sample data
    this.loadSampleData();
    
    // Initialize date strings
    this.reportParams.reportingDate1String = this.formatDateForInput(this.reportParams.reportingDate1);
    this.reportParams.reportingDate2String = this.formatDateForInput(this.reportParams.reportingDate2);
    this.reportParams.reportingDate3String = this.formatDateForInput(this.reportParams.reportingDate3);
    
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
  
  toggleFolder(folder: string): void {
    if (this.expandedFolders.includes(folder)) {
      this.expandedFolders = this.expandedFolders.filter(f => f !== folder);
    } else {
      this.expandedFolders.push(folder);
    }
  }
  
  selectReport(reportId: string): void {
    this.selectedReport = reportId;
  }
  
  getSelectedReportName(): string {
    if (this.selectedReport) {
      const capitalReport = this.capitalReports.find(r => r.id === this.selectedReport);
      if (capitalReport) return capitalReport.name;
      
      const topPositionsReport = this.topPositionsReports.find(r => r.id === this.selectedReport);
      if (topPositionsReport) return topPositionsReport.name;
      
      const buReport = this.buReports.find(r => r.id === this.selectedReport);
      if (buReport) return buReport.name;
    }
    
    return this.reportParams.selectedReport;
  }
  
  onDateChange(dateField: string): void {
    // Convert the string date to a Date object
    if (dateField === 'reportingDate1' && this.reportParams.reportingDate1String) {
      this.reportParams.reportingDate1 = new Date(this.reportParams.reportingDate1String);
    } else if (dateField === 'reportingDate2' && this.reportParams.reportingDate2String) {
      this.reportParams.reportingDate2 = new Date(this.reportParams.reportingDate2String);
    } else if (dateField === 'reportingDate3' && this.reportParams.reportingDate3String) {
      this.reportParams.reportingDate3 = new Date(this.reportParams.reportingDate3String);
    }
  }
  
  formatDateForInput(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  toggleAdjustmentAuthorization() {
    this.isUserAuthorizedForAdjustment = !this.isUserAuthorizedForAdjustment;
  }
  
  toggleReportLauncherAuthorization() {
    this.isUserAuthorizedForReportLauncher = !this.isUserAuthorizedForReportLauncher;
  }
} 