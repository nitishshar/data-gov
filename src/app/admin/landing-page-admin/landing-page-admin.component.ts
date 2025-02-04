import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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
              Fleet Objectives
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
                <mat-form-field appearance="outline" class="color-field">
                  <mat-label>Color</mat-label>
                  <input matInput type="color" formControlName="color">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeObjective(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="2" 
                         placeholder="Enter objective description"></textarea>
              </mat-form-field>
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
                <mat-form-field appearance="outline" class="color-field">
                  <mat-label>Color</mat-label>
                  <input matInput type="color" formControlName="color">
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
                <mat-form-field appearance="outline" class="color-field">
                  <mat-label>Color</mat-label>
                  <input matInput type="color" formControlName="color">
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
                <mat-form-field appearance="outline" class="color-field">
                  <mat-label>Color</mat-label>
                  <input matInput type="color" formControlName="color">
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
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter leader name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="Enter leader title">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeLeader(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="Enter leader email">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <input matInput formControlName="department" placeholder="Enter leader department">
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" placeholder="Enter leader phone">
                </mat-form-field>
                <div class="image-upload">
                  <label>Profile Image</label>
                  <input type="file" (change)="onLeaderImageSelected($event, i)" accept="image/*">
                </div>
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
                <mat-form-field appearance="outline" class="color-field">
                  <mat-label>Color</mat-label>
                  <input matInput type="color" formControlName="color">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeAccomplishment(i)">
                  <mat-icon>delete</mat-icon>
                </button>
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
          padding: 8px 0;
          width: auto;
          min-height: 48px;
        }

        .mdc-floating-label {
          color: #009bda !important;
          top: 33px;
          transform-origin: left top;
          color: rgba(0, 0, 0, 0.6);
          
          &.mdc-floating-label--float-above {
            top: 10px;
            transform: translateY(-160%) scale(0.75);
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

    
  `]
})
export class LandingPageAdminComponent implements OnInit {
  landingPageForm: FormGroup;
  
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

  // Add methods
  addObjective() {
    this.objectivesArray.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: ['#bae1ff', Validators.required],
      link: ['']
    }));
  }

  addTool() {
    this.toolsArray.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: ['#bae1ff', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addProgram() {
    this.programsArray.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: ['#bae1ff', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addSquad() {
    this.squadsArray.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: ['#bae1ff', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addLeader() {
    this.leadershipArray.push(this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      phone: ['', Validators.required],
      image: ['']
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
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      impact: [''],
      color: ['#0d6efd', Validators.required]
    });
    this.accomplishmentsArray.push(accomplishment);
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
      this.objectivesArray.push(this.fb.group(obj));
    });

    this.toolsArray.clear();
    data.tools?.forEach((tool: any) => {
      this.toolsArray.push(this.fb.group(tool));
    });

    this.programsArray.clear();
    data.programs?.forEach((program: any) => {
      this.programsArray.push(this.fb.group(program));
    });

    this.squadsArray.clear();
    data.squads?.forEach((squad: any) => {
      this.squadsArray.push(this.fb.group(squad));
    });

    this.leadershipArray.clear();
    data.leadership?.forEach((leader: any) => {
      this.leadershipArray.push(this.fb.group(leader));
    });

    this.resourcesArray.clear();
    data.resources?.forEach((resource: any) => {
      this.resourcesArray.push(this.fb.group(resource));
    });

    this.accomplishmentsArray.clear();
    data.accomplishments?.forEach((accomplishment: any) => {
      this.accomplishmentsArray.push(this.fb.group(accomplishment));
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