import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FleetDataService } from '../../services/fleet-management.service';

@Component({
  selector: 'app-landing-page-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="admin-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Landing Page Administration</mat-card-title>
          <mat-card-subtitle>Manage and customize your landing page content</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

        <form [formGroup]="landingPageForm" (ngSubmit)="saveLandingPage()">
        <!-- Hero Section -->
        <mat-expansion-panel expanded="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>star</mat-icon>
              Hero Section
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fleet Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter fleet name">
              <mat-hint>This will be displayed as the main title on your landing page</mat-hint>
                  </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mission Statement</mat-label>
              <textarea matInput formControlName="missionStatement" rows="4" 
                              placeholder="Enter your mission statement"></textarea>
              <mat-hint>Describe your fleet's mission and values</mat-hint>
                  </mat-form-field>
                </div>
        </mat-expansion-panel>

        <!-- Objectives Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>track_changes</mat-icon>
              Objectives
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addObjective()">
                <mat-icon>add</mat-icon>
                Add Objective
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="objectives">
            <div *ngFor="let objective of objectivesArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Objective Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter objective name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeObjective(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" 
                           placeholder="Enter objective description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter objective link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Tools Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>build</mat-icon>
              Tools
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addTool()">
                <mat-icon>add</mat-icon>
                Add Tool
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="tools">
            <div *ngFor="let tool of toolsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Tool Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter tool name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeTool(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" 
                           placeholder="Enter tool description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter tool link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Programs Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>school</mat-icon>
              Programs
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addProgram()">
                <mat-icon>add</mat-icon>
                Add Program
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="programs">
            <div *ngFor="let program of programsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Program Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter program name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeProgram(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" 
                           placeholder="Enter program description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter program link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Squads Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>groups</mat-icon>
              Squads
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addSquad()">
                <mat-icon>add</mat-icon>
                Add Squad
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="squads">
            <div *ngFor="let squad of squadsArray.controls; let i = index" 
                 [formGroupName]="i"
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Squad Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter squad name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeSquad(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" 
                           placeholder="Enter squad description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter squad link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Leadership Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>person</mat-icon>
              Leadership
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addLeader()">
                <mat-icon>add</mat-icon>
                Add Leader
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="leadership">
            <div *ngFor="let leader of leadershipArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>User ID</mat-label>
                  <input matInput formControlName="userid" placeholder="Enter user ID">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Role</mat-label>
                  <mat-select formControlName="role">
                    <mat-option *ngFor="let role of roleOptions" [value]="role">
                      {{role}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeLeader(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Resources Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>link</mat-icon>
              Resources
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addResource()">
                <mat-icon>add</mat-icon>
                Add Resource
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="resources">
            <div *ngFor="let resource of resourcesArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Resource Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter resource name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter resource link">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeResource(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Accomplishments Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>emoji_events</mat-icon>
              Accomplishments
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addAccomplishment()">
                <mat-icon>add</mat-icon>
                Add Accomplishment
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div formArrayName="accomplishments">
            <div *ngFor="let accomplishment of accomplishmentsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="Enter accomplishment title">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Squad</mat-label>
                  <input matInput formControlName="squad" placeholder="Enter squad name">
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" 
                           placeholder="Enter accomplishment description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput formControlName="date" [matDatepicker]="picker" placeholder="Choose a date">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Impact</mat-label>
                  <input matInput formControlName="impact" placeholder="Enter impact or metrics">
                </mat-form-field>
              </div>

              <!-- Benefits Section -->
              <div class="sub-section">
                <div class="sub-section-header">
                  <h4>Benefits</h4>
                  <button mat-mini-fab color="primary" type="button" (click)="addBenefit(i)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div formArrayName="benefits">
                  <div *ngFor="let benefit of getBenefitsArray(accomplishment).controls; let j = index" 
                       class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Benefit</mat-label>
                      <input matInput [formControlName]="j" placeholder="Enter benefit">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeBenefit(accomplishment, j)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Team Members Section -->
              <div class="sub-section">
                <div class="sub-section-header">
                  <h4>Team Members</h4>
                  <button mat-mini-fab color="primary" type="button" (click)="addTeamMember(i)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div formArrayName="teamMembers">
                  <div *ngFor="let member of getTeamMembersArray(accomplishment).controls; let j = index" 
                       [formGroupName]="j"
                       class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>User ID</mat-label>
                      <input matInput formControlName="userid" placeholder="Enter user ID">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Role</mat-label>
                      <mat-select formControlName="role">
                        <mat-option *ngFor="let role of roleOptions" [value]="role">
                          {{role}}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Contribution</mat-label>
                      <input matInput formControlName="contribution" placeholder="Enter contribution">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeTeamMember(accomplishment, j)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Metrics Section -->
              <div class="sub-section">
                <div class="sub-section-header">
                  <h4>Metrics</h4>
                  <button mat-mini-fab color="primary" type="button" (click)="addMetric(i)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div formArrayName="metrics">
                  <div *ngFor="let metric of getMetricsArray(accomplishment).controls; let j = index" 
                       [formGroupName]="j"
                       class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Label</mat-label>
                      <input matInput formControlName="label" placeholder="Enter metric label">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Value</mat-label>
                      <input matInput formControlName="value" placeholder="Enter metric value">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeMetric(accomplishment, j)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <button mat-icon-button color="warn" type="button" (click)="removeAccomplishment(i)" class="remove-button">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Form Actions -->
        <div class="form-actions">
          <button mat-stroked-button type="button">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!landingPageForm.valid">
            <mat-icon>save</mat-icon>
            Save Changes
          </button>
        </div>
        </form>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .header-card {
      margin-bottom: 2rem;
      background: #fff;
      
      mat-card-title {
        font-size: 1.75rem;
        margin-bottom: 0.5rem;
        color: #2c3e50;
      }

      mat-card-subtitle {
        color: #6c757d;
      }
    }

    mat-expansion-panel {
      margin-bottom: 1rem;
      background: #fff;

      .mat-expansion-panel-header {
        height: auto;
        padding: 1rem 1.5rem;

        &.mat-expanded {
          height: auto;
        }
      }

      .mat-expansion-panel-header-title {
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 1.1rem;
        
        mat-icon {
          color: #6c757d;
        }
      }

      .mat-expansion-panel-header-description {
        justify-content: flex-end;
        align-items: center;
        margin: 0;
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: flex-start;

      .mat-mdc-form-field {
        flex: 1;
        font-size: 14px;
        &.color-field {
          width: 120px;
          flex: 0 0 auto;
        }
      }

      button {
        margin-top: 0.5rem;
      }
    }

    .array-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 1.5rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .full-width {
      width: 100%;
    }

    .image-upload {
      flex: 1;
      margin-top: 0.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.875rem;
      }

      input[type="file"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;

      button {
        min-width: 120px;
      }
    }

    ::ng-deep {
      .mdc-text-field--outlined {
        --mdc-outlined-text-field-container-shape: 4px;
        --mdc-outlined-text-field-outline-color: #dee2e6;
        --mdc-outlined-text-field-focus-outline-color: #009bda;
        --mdc-outlined-text-field-error-outline-color: #dc3545;
        --mdc-outlined-text-field-focus-label-text-color: #009bda;
        --mdc-outlined-text-field-label-text-color: rgba(0, 0, 0, 0.6);
      }

      .mat-mdc-form-field {
        display: block;

        .mdc-notched-outline__notch {
          border-right: none;
        }

        .mat-mdc-form-field-flex {
          display: flex;
          align-items: center;
          min-height: 56px;
        }

        .mat-mdc-text-field-wrapper {
          padding: 0;
          height: auto;
        }

        .mat-mdc-form-field-infix {
          padding: 5px !important;
          width: auto;
          min-height: 48px;
        }

        .mdc-floating-label {
          color: #009bda !important;
          top: 33px; 
          font-size: 16px !important;
          transform-origin: left top;
          color: rgba(0, 0, 0, 0.6);
          
          &.mdc-floating-label--float-above {
            top: 10px;
            transform: translateY(-5px) scale(0.85) !important;
          }
        }

        &.mat-focused {
          .mdc-floating-label {
            color: #009bda;
          }
        }

        &.mat-form-field-appearance-outline .mat-form-field-outline {
          color: rgba(0, 0, 0, 0.12);
        }

        &.mat-form-field-should-float .mat-form-field-label {
          transform: translateY(-160%) scale(0.75);
        }

        .mat-mdc-form-field-hint {
          color: rgba(0, 0, 0, 0.6);
        }

        textarea.mat-mdc-input-element {
          margin: 0;
          padding: 8px 0;
        }
      }

      .mat-expansion-panel-body {
        padding: 1.5rem;
      }

      .mat-mdc-raised-button {
        &.mat-primary {
          --mdc-protected-button-container-color: #009bda;
          --mdc-protected-button-label-text-color: #fff;

          &:hover {
            --mdc-protected-button-container-color: #0089c3;
          }
        }
      }

      .mat-mdc-stroked-button {
        --mdc-outlined-button-outline-color: #009bda;
        --mdc-outlined-button-label-text-color: #009bda;

        &:hover {
          background-color: rgba(0, 155, 218, 0.04);
        }
      }

      .mat-expansion-panel {
        .mat-expansion-panel-header {
          &.mat-expanded,
          &:hover {
            background-color: rgba(0, 155, 218, 0.04);
          }
        }

        .mat-expansion-indicator::after {
          color: #009bda;
        }
      }

      .mat-mdc-icon-button {
        --mdc-icon-button-icon-color: #009bda;
        
        &.mat-warn {
          --mdc-icon-button-icon-color: #dc3545;
        }
      }

      .mat-mdc-select {
        width: 100%;
      }

      .mat-mdc-select-panel {
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-height: 256px !important;
      }

      .mat-mdc-option {
        font-size: 0.875rem;
        height: 40px !important;
        line-height: 40px;
        padding: 0 16px;

        &:hover:not(.mat-mdc-option-disabled) {
          background: rgba(0, 0, 0, 0.04);
        }

        &.mat-mdc-option-active {
          background: rgba(0, 0, 0, 0.08);
        }

        &.mat-mdc-selected:not(.mat-mdc-option-multiple):not(.mat-mdc-option-disabled) {
          background: rgba(25, 118, 210, 0.12);
          
          .mdc-list-item__primary-text {
            color: #1976d2;
          }
        }

        .mdc-list-item__primary-text {
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.87);
        }
      }

      .mat-mdc-select-value {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.87);
      }

      .mat-mdc-select-arrow {
        color: rgba(0, 0, 0, 0.54);
      }

      .mat-mdc-form-field-subscript-wrapper {
        height: 0;
      }
    }

    mat-expansion-panel {
      .mat-expansion-panel-header-title {
        color: #009bda;
        
        mat-icon {
          color: #009bda;
        }
      }
    }

    @media (max-width: 768px) {
      .admin-container {
        padding: 1rem;
        margin: 1rem auto;
      }

      .form-row {
        flex-direction: column;
        gap: 0;

        .mat-mdc-form-field {
          width: 100%;

          &.color-field {
            width: 100%;
          }
        }

        button {
          align-self: flex-end;
        }
      }

      .form-actions {
        flex-direction: column-reverse;
        
        button {
          width: 100%;
        }
      }

      mat-expansion-panel {
        .mat-expansion-panel-header-description {
          display: none;
        }
      }
    }

    .sub-section {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .sub-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.1rem;
      }
    }

    .remove-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .array-item {
      position: relative;
    }
  `]
})
export class LandingPageAdminComponent implements OnInit {
  landingPageForm: FormGroup;
  roleOptions: string[] = [
    'Application Development',
    'Business Analyst',
    'Product Owner',
    'Scrum Master',
    'Testing',
    'UI/UX',
    'Chapter Lead',
    'DevOPs champion',
    'Fleet Lead',
    'Other',
    'SME',
    'Production Management',
    'Tech Lead',
    'Tech Area Lead',
    'Testing -QA Manual'
  ];

  constructor(
    private fb: FormBuilder,
    private fleetDataService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.landingPageForm = this.fb.group({
      name: ['', Validators.required],
      missionStatement: ['', Validators.required],
      objectives: this.fb.array([]),
      tools: this.fb.array([]),
      programs: this.fb.array([]),
      squads: this.fb.array([]),
      leadership: this.fb.array([]),
      resources: this.fb.array([]),
      accomplishments: this.fb.array([])
    });
  }

  ngOnInit() {
    const fleetData = this.fleetDataService.getFleetData()();
    if (fleetData) {
      this.patchFormWithData(fleetData);
    }
  }

  // Getters for form arrays
  get objectivesArray() { return this.landingPageForm.get('objectives') as FormArray; }
  get toolsArray() { return this.landingPageForm.get('tools') as FormArray; }
  get programsArray() { return this.landingPageForm.get('programs') as FormArray; }
  get squadsArray() { return this.landingPageForm.get('squads') as FormArray; }
  get leadershipArray() { return this.landingPageForm.get('leadership') as FormArray; }
  get resourcesArray() { return this.landingPageForm.get('resources') as FormArray; }
  get accomplishmentsArray() {
    return this.landingPageForm.get('accomplishments') as FormArray;
  }

  // Helper methods for type-safe form array access
  getBenefitsArray(accomplishment: AbstractControl): FormArray {
    return accomplishment.get('benefits') as FormArray;
  }

  getTeamMembersArray(accomplishment: AbstractControl): FormArray {
    return accomplishment.get('teamMembers') as FormArray;
  }

  getMetricsArray(accomplishment: AbstractControl): FormArray {
    return accomplishment.get('metrics') as FormArray;
  }

  // Helper methods for removing items from arrays
  removeBenefit(accomplishment: AbstractControl, index: number): void {
    const benefitsArray = this.getBenefitsArray(accomplishment);
    if (benefitsArray) {
      benefitsArray.removeAt(index);
    }
  }

  removeTeamMember(accomplishment: AbstractControl, index: number): void {
    const teamMembersArray = this.getTeamMembersArray(accomplishment);
    if (teamMembersArray) {
      teamMembersArray.removeAt(index);
    }
  }

  removeMetric(accomplishment: AbstractControl, index: number): void {
    const metricsArray = this.getMetricsArray(accomplishment);
    if (metricsArray) {
      metricsArray.removeAt(index);
    }
  }

  // Add methods
  addObjective() {
    this.objectivesArray.push(this.fb.group({
      id: [this.getNextId(this.objectivesArray), Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addTool() {
    this.toolsArray.push(this.fb.group({
      id: [this.getNextId(this.toolsArray), Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addProgram() {
    this.programsArray.push(this.fb.group({
      id: [this.getNextId(this.programsArray), Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addSquad() {
    this.squadsArray.push(this.fb.group({
      id: [this.getNextId(this.squadsArray), Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addLeader() {
    this.leadershipArray.push(this.fb.group({
      userid: ['', Validators.required],
      role: ['', Validators.required]
    }));
  }

  addResource() {
    this.resourcesArray.push(this.fb.group({
      name: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addAccomplishment() {
    const accomplishment = this.fb.group({
      id: [this.getNextId(this.accomplishmentsArray), Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      squad: ['', Validators.required],
      date: ['', Validators.required],
      impact: ['', Validators.required],
      benefits: this.fb.array([]),
      teamMembers: this.fb.array([]),
      metrics: this.fb.array([])
    });
    this.accomplishmentsArray.push(accomplishment);
  }

  addTeamMember(accomplishmentIndex: number) {
    const teamMembers = (this.accomplishmentsArray.at(accomplishmentIndex).get('teamMembers') as FormArray);
    teamMembers.push(this.fb.group({
      userid: ['', Validators.required],
      role: ['', Validators.required],
      contribution: ['', Validators.required]
    }));
  }

  addBenefit(accomplishmentIndex: number) {
    const benefits = (this.accomplishmentsArray.at(accomplishmentIndex).get('benefits') as FormArray);
    benefits.push(this.fb.control('', Validators.required));
  }

  addMetric(accomplishmentIndex: number) {
    const metrics = (this.accomplishmentsArray.at(accomplishmentIndex).get('metrics') as FormArray);
    metrics.push(this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  private getNextId(formArray: FormArray): string {
    let maxId = 0;
    formArray.controls.forEach(control => {
      const id = parseInt(control.get('id')?.value || '0');
      if (id > maxId) maxId = id;
    });
    return (maxId + 1).toString();
  }

  // Remove methods
  removeObjective(index: number) { this.objectivesArray.removeAt(index); }
  removeTool(index: number) { this.toolsArray.removeAt(index); }
  removeProgram(index: number) { this.programsArray.removeAt(index); }
  removeSquad(index: number) { this.squadsArray.removeAt(index); }
  removeLeader(index: number) { this.leadershipArray.removeAt(index); }
  removeResource(index: number) { this.resourcesArray.removeAt(index); }
  removeAccomplishment(index: number) { this.accomplishmentsArray.removeAt(index); }

  // Image handling
  onLeaderImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Here you would typically upload the file to your server
      // For now, we'll just store the file name
      const leader = this.leadershipArray.at(index);
      leader.patchValue({ image: file.name });
    }
  }

  private patchFormWithData(data: any) {
    this.landingPageForm.patchValue({
      name: data.name,
      missionStatement: data.missionStatement
    });

    // Clear and repopulate arrays
    this.objectivesArray.clear();
    data.objectives?.forEach((obj: any) => {
      this.objectivesArray.push(this.fb.group({
        id: [obj.id || this.getNextId(this.objectivesArray)],
        name: [obj.name, Validators.required],
        description: [obj.description, Validators.required],
        link: [obj.link, Validators.required]
      }));
    });

    this.toolsArray.clear();
    data.tools?.forEach((tool: any) => {
      this.toolsArray.push(this.fb.group({
        id: [tool.id || this.getNextId(this.toolsArray)],
        name: [tool.name, Validators.required],
        description: [tool.description, Validators.required],
        link: [tool.link, Validators.required]
      }));
    });

    this.programsArray.clear();
    data.programs?.forEach((program: any) => {
      this.programsArray.push(this.fb.group({
        id: [program.id || this.getNextId(this.programsArray)],
        name: [program.name, Validators.required],
        description: [program.description, Validators.required],
        link: [program.link, Validators.required]
      }));
    });

    this.squadsArray.clear();
    data.squads?.forEach((squad: any) => {
      this.squadsArray.push(this.fb.group({
        id: [squad.id || this.getNextId(this.squadsArray)],
        name: [squad.name, Validators.required],
        description: [squad.description, Validators.required],
        link: [squad.link, Validators.required]
      }));
    });

    this.leadershipArray.clear();
    data.leadership?.forEach((leader: any) => {
      this.leadershipArray.push(this.fb.group({
        userid: [leader.userid, Validators.required],
        role: [leader.role, Validators.required]
      }));
    });

    this.resourcesArray.clear();
    data.resources?.forEach((resource: any) => {
      this.resourcesArray.push(this.fb.group({
        name: [resource.name, Validators.required],
        link: [resource.link, Validators.required]
      }));
    });

    this.accomplishmentsArray.clear();
    data.accomplishments?.forEach((accomplishment: any) => {
      const accomplishmentGroup = this.fb.group({
        id: [accomplishment.id || this.getNextId(this.accomplishmentsArray)],
        title: [accomplishment.title, Validators.required],
        description: [accomplishment.description, Validators.required],
        squad: [accomplishment.squad, Validators.required],
        date: [new Date(accomplishment.date), Validators.required],
        impact: [accomplishment.impact, Validators.required],
        benefits: this.fb.array([]),
        teamMembers: this.fb.array([]),
        metrics: this.fb.array([])
      });

      // Add benefits
      const benefitsArray = accomplishmentGroup.get('benefits') as FormArray;
      accomplishment.benefits?.forEach((benefit: string) => {
        benefitsArray.push(this.fb.control(benefit, Validators.required));
      });

      // Add team members
      const teamMembersArray = accomplishmentGroup.get('teamMembers') as FormArray;
      accomplishment.teamMembers?.forEach((member: any) => {
        teamMembersArray.push(this.fb.group({
          userid: [member.userid, Validators.required],
          role: [member.role, Validators.required],
          contribution: [member.contribution, Validators.required]
        }));
      });

      // Add metrics
      const metricsArray = accomplishmentGroup.get('metrics') as FormArray;
      accomplishment.metrics?.forEach((metric: any) => {
        metricsArray.push(this.fb.group({
          label: [metric.label, Validators.required],
          value: [metric.value, Validators.required]
        }));
      });

      this.accomplishmentsArray.push(accomplishmentGroup);
    });
  }

  saveLandingPage() {
    if (this.landingPageForm.valid) {
      const currentData = this.fleetDataService.getFleetData()();
      const updatedData = {
        ...currentData,
        ...this.landingPageForm.value
      };
      
      this.fleetDataService.getFleetData().set(updatedData);
      
      this.snackBar.open('Landing page updated successfully', 'Close', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
} 