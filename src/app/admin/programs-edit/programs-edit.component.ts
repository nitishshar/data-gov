import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { FleetDataService } from '../../services/fleet-management.service';

@Component({
  selector: 'app-programs-edit',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule
  ],
  template: `
    <div class="programs-edit">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Program Administration</mat-card-title>
          <mat-card-subtitle>Manage and customize your program details</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <form [formGroup]="programForm" (ngSubmit)="saveProgram()">
        <!-- Basic Information -->
        <mat-expansion-panel expanded="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>info</mat-icon>
              Basic Information
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Program Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter program title">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mission Statement</mat-label>
              <textarea matInput formControlName="missionStatement" rows="4" placeholder="Enter mission statement"></textarea>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="6" placeholder="Enter program description"></textarea>
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <!-- Milestones -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>timeline</mat-icon>
              Milestones
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addMilestone()">
                <mat-icon>add</mat-icon>
                Add Milestone
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="milestones">
            <div *ngFor="let milestone of milestones.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="Milestone title">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeMilestone(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Milestone description"></textarea>
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Leadership -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>people</mat-icon>
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
            <div *ngFor="let leader of leadership.controls; let i = index" [formGroupName]="i" class="array-item">
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

        <!-- Documents -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>description</mat-icon>
              Documents
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addDocument()">
                <mat-icon>add</mat-icon>
                Add Document
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="documents">
            <div *ngFor="let doc of documents.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Document name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Squad</mat-label>
                  <mat-select formControlName="squad">
                    <mat-option *ngFor="let squad of availableSquads" [value]="squad.id">
                      {{squad.name}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="form-row">
                <div formGroupName="editor">
                  <mat-form-field appearance="outline">
                    <mat-label>Editor User ID</mat-label>
                    <input matInput formControlName="userid" placeholder="Editor user ID">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Editor Role</mat-label>
                    <mat-select formControlName="role">
                      <mat-option *ngFor="let role of roleOptions" [value]="role">
                        {{role}}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline">
                  <mat-label>Edit Date</mat-label>
                  <input matInput [matDatepicker]="docPicker" formControlName="editedAt">
                  <mat-datepicker-toggle matSuffix [for]="docPicker"></mat-datepicker-toggle>
                  <mat-datepicker #docPicker></mat-datepicker>
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeDocument(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- News -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>newspaper</mat-icon>
              News
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addNews()">
                <mat-icon>add</mat-icon>
                Add News
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="news">
            <div *ngFor="let item of news.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="News title">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="newsPicker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="newsPicker"></mat-datepicker-toggle>
                  <mat-datepicker #newsPicker></mat-datepicker>
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeNews(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="News description"></textarea>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="News link">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Squads -->
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
            <div *ngFor="let squad of squads.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Squad</mat-label>
                  <mat-select formControlName="name">
                    <mat-option *ngFor="let squad of availableSquads" [value]="squad.id">
                      {{squad.name}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Members</mat-label>
                  <input matInput type="number" formControlName="members" placeholder="Number of members">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Progress (%)</mat-label>
                  <input matInput type="number" formControlName="progress" min="0" max="100">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeSquad(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Squad description"></textarea>
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Events -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>event</mat-icon>
              Events
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addEvent()">
                <mat-icon>add</mat-icon>
                Add Event
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="events">
            <div *ngFor="let event of events.controls; let i = index" [formGroupName]="i" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="Event title">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="eventPicker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="eventPicker"></mat-datepicker-toggle>
                  <mat-datepicker #eventPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <input matInput formControlName="type" placeholder="Event type">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeEvent(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Event description"></textarea>
                </mat-form-field>
              </div>
            </div>
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
    .programs-edit {
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
      .programs-edit {
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
export class ProgramsEditComponent implements OnInit {
  programForm!: FormGroup;
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
    private fleetService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadSquads();
  }

  private initForm() {
    this.programForm = this.fb.group({
      title: ['', Validators.required],
      missionStatement: ['', Validators.required],
      description: ['', Validators.required],
      milestones: this.fb.array([]),
      leadership: this.fb.array([]),
      documents: this.fb.array([]),
      news: this.fb.array([]),
      squads: this.fb.array([]),
      events: this.fb.array([])
    });
  }

  private loadSquads() {
    const fleetData = this.fleetService.getFleetData()();
    if (fleetData?.squads) {
      this.availableSquads = fleetData.squads;
    }
  }

  get milestones() {
    return this.programForm.get('milestones') as FormArray;
  }

  get leadership() {
    return this.programForm.get('leadership') as FormArray;
  }

  get documents() {
    return this.programForm.get('documents') as FormArray;
  }

  get news() {
    return this.programForm.get('news') as FormArray;
  }

  get squads() {
    return this.programForm.get('squads') as FormArray;
  }

  get events() {
    return this.programForm.get('events') as FormArray;
  }

  addMilestone() {
    const milestone = this.fb.group({
      date: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.milestones.push(milestone);
  }

  removeMilestone(index: number) {
    this.milestones.removeAt(index);
  }

  addLeader() {
    const leader = this.fb.group({
      userid: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.leadership.push(leader);
  }

  removeLeader(index: number) {
    this.leadership.removeAt(index);
  }

  addDocument() {
    const document = this.fb.group({
      name: ['', Validators.required],
      squad: ['', Validators.required],
      userid: ['', Validators.required],
      role: ['', Validators.required],
      editedAt: [new Date(), Validators.required]
    });
    this.documents.push(document);
  }

  removeDocument(index: number) {
    this.documents.removeAt(index);
  }

  addNews() {
    const news = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
    this.news.push(news);
  }

  removeNews(index: number) {
    this.news.removeAt(index);
  }

  addSquad() {
    const squad = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      members: [0, [Validators.required, Validators.min(0)]],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.squads.push(squad);
  }

  removeSquad(index: number) {
    this.squads.removeAt(index);
  }

  addEvent() {
    const event = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
    this.events.push(event);
  }

  removeEvent(index: number) {
    this.events.removeAt(index);
  }

  saveProgram() {
    if (this.programForm.valid) {
      console.log('Program data:', this.programForm.value);
      this.snackBar.open('Program updated successfully', 'Close', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
} 