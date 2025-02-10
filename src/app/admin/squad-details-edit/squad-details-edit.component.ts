import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { FleetDataService } from '../../services/fleet-management.service';

@Component({
  selector: 'app-squad-details-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule
  ],
  template: `
    <div class="squad-details-edit">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Squad Details Administration</mat-card-title>
          <mat-card-subtitle>Manage and customize your squad details</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <form [formGroup]="squadForm" (ngSubmit)="saveSquadDetails()">
        <!-- Basic Info Section -->
        <mat-expansion-panel expanded="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>info</mat-icon>
              Basic Information
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Select Squad</mat-label>
              <mat-select formControlName="squadId" (selectionChange)="onSquadSelect($event)">
                <mat-option *ngFor="let squad of availableSquads" [value]="squad?.id">
                  {{squad?.id}} - {{squad?.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Squad Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter squad name">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mission Statement</mat-label>
              <textarea matInput formControlName="missionStatement" rows="4" placeholder="Enter mission statement"></textarea>
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <!-- Leader Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>person</mat-icon>
              Squad Leader
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div formGroupName="leader">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>User ID</mat-label>
                <input matInput formControlName="userid" placeholder="Enter leader's user ID">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option *ngFor="let role of roleOptions" [value]="role">
                    {{role}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
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
            <div *ngFor="let objective of objectives.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter objective name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeObjective(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" placeholder="Enter description"></textarea>
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

        <!-- Members Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>group</mat-icon>
              Members
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addMember()">
                <mat-icon>add</mat-icon>
                Add Member
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="members">
            <div *ngFor="let member of members.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>User ID</mat-label>
                  <input matInput formControlName="userid" placeholder="Enter member's user ID">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Role</mat-label>
                  <mat-select formControlName="role">
                    <mat-option *ngFor="let role of roleOptions" [value]="role">
                      {{role}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeMember(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Recent Documents Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>description</mat-icon>
              Recent Documents
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addDocument()">
                <mat-icon>add</mat-icon>
                Add Document
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="recentDocuments">
            <div *ngFor="let doc of recentDocuments.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter document name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <input matInput formControlName="type" placeholder="Enter document type">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>User ID</mat-label>
                  <input matInput formControlName="userid" placeholder="Enter user ID">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Time</mat-label>
                  <input matInput type="datetime-local" formControlName="time">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeDocument(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Projects Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>work</mat-icon>
              Projects
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addProject()">
                <mat-icon>add</mat-icon>
                Add Project
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="projects">
            <div *ngFor="let project of projects.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter project name">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeProject(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2" placeholder="Enter description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter project link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Help and Support Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>help</mat-icon>
              Help and Support
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Help and Support Information</mat-label>
              <textarea matInput formControlName="helpAndSupport" rows="4" placeholder="Enter help and support information"></textarea>
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <div class="form-actions">
          <div class="action-buttons">
            <button mat-stroked-button type="button">Cancel</button>
            <button mat-flat-button color="primary" type="submit">
              <mat-icon>save</mat-icon>
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .squad-details-edit {
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

      .mat-mdc-raised-button {
        &.mat-primary {
          --mdc-protected-button-container-color: #009bda;
          --mdc-protected-button-label-text-color: #fff;

          &:hover {
            --mdc-protected-button-container-color: #0089c3;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .squad-details-edit {
        padding: 1rem;
        margin: 1rem auto;
      }

      .form-row {
        flex-direction: column;
        gap: 0;

        .mat-mdc-form-field {
          width: 100%;
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
export class SquadDetailsEditComponent implements OnInit {
  squadForm: FormGroup;
  availableSquads: any[] = [];
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
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fleetDataService: FleetDataService
  ) {
    this.squadForm = this.fb.group({
      squadId: ['', Validators.required],
      name: ['', Validators.required],
      missionStatement: ['', Validators.required],
      leader: this.fb.group({
        userid: ['', Validators.required],
        role: ['', Validators.required]
      }),
      objectives: this.fb.array([]),
      members: this.fb.array([]),
      recentDocuments: this.fb.array([]),
      projects: this.fb.array([]),
      helpAndSupport: ['']
    });
  }

  ngOnInit() {
    this.loadAvailableSquads();
  }

  private loadAvailableSquads() {
    const fleetData = this.fleetDataService.getFleetData()();
    if (fleetData?.squads) {
      this.availableSquads = fleetData.squads;
    }
  }

  onSquadSelect(event: any) {
    const selectedSquad = this.availableSquads.find(squad => squad.id === event.value);
    if (selectedSquad) {
      this.squadForm.patchValue({
        name: selectedSquad.name,
        link: selectedSquad.link
      });
    }
  }

  // Getters for form arrays
  get objectives() { return this.squadForm.get('objectives') as FormArray; }
  get members() { return this.squadForm.get('members') as FormArray; }
  get recentDocuments() { return this.squadForm.get('recentDocuments') as FormArray; }
  get projects() { return this.squadForm.get('projects') as FormArray; }

  // Add methods
  addObjective() {
    this.objectives.push(this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  addMember() {
    this.members.push(this.fb.group({
      userid: ['', Validators.required],
      role: ['', Validators.required]
    }));
  }

  addDocument() {
    this.recentDocuments.push(this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      userid: ['', Validators.required],
      time: ['', Validators.required]
    }));
  }

  addProject() {
    this.projects.push(this.fb.group({
      id: [this.getNextProjectId()],
      name: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    }));
  }

  // Remove methods
  removeObjective(index: number) { this.objectives.removeAt(index); }
  removeMember(index: number) { this.members.removeAt(index); }
  removeDocument(index: number) { this.recentDocuments.removeAt(index); }
  removeProject(index: number) { this.projects.removeAt(index); }

  private getNextProjectId(): string {
    let maxId = 0;
    this.projects.controls.forEach(control => {
      const id = parseInt(control.get('id')?.value || '0');
      if (id > maxId) maxId = id;
    });
    return (maxId + 1).toString();
  }

  saveSquadDetails() {
    if (this.squadForm.valid) {
      this.http.post('/api/squads', this.squadForm.value).subscribe({
        next: () => {
          this.snackBar.open('Squad details saved successfully', 'Close', {
            duration: 3000
          });
        },
        error: () => {
          this.snackBar.open('Error saving squad details', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
} 