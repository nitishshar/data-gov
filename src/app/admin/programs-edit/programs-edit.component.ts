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
    MatNativeDateModule
  ],
  template: `
    <div class="programs-edit">
      <form [formGroup]="programForm" class="edit-form">
        <!-- Basic Information -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Basic Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline">
              <mat-label>Program Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter program title">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mission Statement</mat-label>
              <textarea matInput formControlName="missionStatement" rows="4" placeholder="Enter mission statement"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Program Description</mat-label>
              <textarea matInput formControlName="description" rows="6" placeholder="Enter program description"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Roadmap -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Roadmap</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="roadmap-type">
              <mat-form-field appearance="outline">
                <mat-label>Roadmap Type</mat-label>
                <mat-select formControlName="roadmapType">
                  <mat-option value="text">Text Timeline</mat-option>
                  <mat-option value="image">Image Upload</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <ng-container *ngIf="programForm.get('roadmapType')?.value === 'image'">
              <div class="image-upload">
                <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*">
                <button mat-raised-button color="primary" (click)="fileInput.click()">
                  <mat-icon>upload</mat-icon>
                  Upload Roadmap Image
                </button>
              </div>
            </ng-container>

            <ng-container *ngIf="programForm.get('roadmapType')?.value === 'text'">
              <div formArrayName="milestones" class="milestones-list">
                <div *ngFor="let milestone of milestones.controls; let i = index" [formGroupName]="i" class="milestone-item">
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

                  <mat-form-field appearance="outline">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" placeholder="Milestone description"></textarea>
                  </mat-form-field>

                  <button mat-icon-button color="warn" (click)="removeMilestone(i)" type="button">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <button mat-raised-button color="primary" (click)="addMilestone()" type="button">
                  <mat-icon>add</mat-icon>
                  Add Milestone
                </button>
              </div>
            </ng-container>
          </mat-card-content>
        </mat-card>

        <!-- Recent Documents -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Recent Documents</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="documents" class="documents-list">
              <div *ngFor="let doc of documents.controls; let i = index" [formGroupName]="i" class="document-item">
                <mat-form-field appearance="outline">
                  <mat-label>Document Name</mat-label>
                  <input matInput formControlName="name" placeholder="Document name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Squad</mat-label>
                  <input matInput formControlName="squad" placeholder="Managing squad">
                </mat-form-field>

                <div class="editor-info">
                  <mat-form-field appearance="outline">
                    <mat-label>Editor Name</mat-label>
                    <input matInput formControlName="editorName" placeholder="Editor name">
                  </mat-form-field>

                  <div class="image-upload">
                    <input type="file" #editorImage (change)="onEditorImageSelected($event, i)" accept="image/*">
                    <button mat-raised-button color="primary" (click)="editorImage.click()">
                      <mat-icon>photo_camera</mat-icon>
                      Editor Photo
                    </button>
                  </div>
                </div>

                <div class="document-upload">
                  <input type="file" #docThumbnail (change)="onDocumentThumbnailSelected($event, i)" accept="image/*">
                  <button mat-raised-button color="primary" (click)="docThumbnail.click()">
                    <mat-icon>image</mat-icon>
                    Document Thumbnail
                  </button>
                </div>

                <button mat-icon-button color="warn" (click)="removeDocument(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-raised-button color="primary" (click)="addDocument()" type="button">
                <mat-icon>add</mat-icon>
                Add Document
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Latest News -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Latest News</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="news" class="news-list">
              <div *ngFor="let item of news.controls; let i = index" [formGroupName]="i" class="news-item">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="News title">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="News description"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="News link">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="newsPicker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="newsPicker"></mat-datepicker-toggle>
                  <mat-datepicker #newsPicker></mat-datepicker>
                </mat-form-field>

                <button mat-icon-button color="warn" (click)="removeNews(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-raised-button color="primary" (click)="addNews()" type="button">
                <mat-icon>add</mat-icon>
                Add News
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Program Squads -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Program Squads</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="squads" class="squads-list">
              <div *ngFor="let squad of squads.controls; let i = index" [formGroupName]="i" class="squad-item">
                <mat-form-field appearance="outline">
                  <mat-label>Squad Name</mat-label>
                  <input matInput formControlName="name" placeholder="Squad name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Squad description"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Number of Members</mat-label>
                  <input matInput type="number" formControlName="members" placeholder="Number of members">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Progress (%)</mat-label>
                  <input matInput type="number" formControlName="progress" placeholder="Progress percentage" min="0" max="100">
                </mat-form-field>

                <button mat-icon-button color="warn" (click)="removeSquad(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-raised-button color="primary" (click)="addSquad()" type="button">
                <mat-icon>add</mat-icon>
                Add Squad
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Upcoming Events -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Upcoming Events</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="events" class="events-list">
              <div *ngFor="let event of events.controls; let i = index" [formGroupName]="i" class="event-item">
                <mat-form-field appearance="outline">
                  <mat-label>Event Title</mat-label>
                  <input matInput formControlName="title" placeholder="Event title">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Event description"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Event Type</mat-label>
                  <input matInput formControlName="type" placeholder="Event type">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="eventPicker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="eventPicker"></mat-datepicker-toggle>
                  <mat-datepicker #eventPicker></mat-datepicker>
                </mat-form-field>

                <button mat-icon-button color="warn" (click)="removeEvent(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-raised-button color="primary" (click)="addEvent()" type="button">
                <mat-icon>add</mat-icon>
                Add Event
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Leadership -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Leadership</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="leadership" class="leadership-list">
              <div *ngFor="let leader of leadership.controls; let i = index" [formGroupName]="i" class="leader-item">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Leader name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Position</mat-label>
                  <input matInput formControlName="position" placeholder="Leader position">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Contact</mat-label>
                  <input matInput formControlName="contact" placeholder="Contact email">
                </mat-form-field>

                <div class="image-upload">
                  <input type="file" #leaderImage (change)="onLeaderImageSelected($event, i)" accept="image/*">
                  <button mat-raised-button color="primary" (click)="leaderImage.click()">
                    <mat-icon>photo_camera</mat-icon>
                    Upload Photo
                  </button>
                </div>

                <button mat-icon-button color="warn" (click)="removeLeader(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-raised-button color="primary" (click)="addLeader()" type="button">
                <mat-icon>add</mat-icon>
                Add Leader
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Save Button -->
        <div class="form-actions">
          <button mat-raised-button color="primary" (click)="saveProgram()" [disabled]="!programForm.valid">
            <mat-icon>save</mat-icon>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
      background-image: 
        linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 100%),
        repeating-linear-gradient(45deg, rgba(186,225,255,0.05) 0px, rgba(186,225,255,0.05) 10px, transparent 10px, transparent 20px);
      background-attachment: fixed;
      color: #2c3e50;
    }

    .programs-edit {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      perspective: 1000px;
    }

    .form-section {
      margin-bottom: 2rem;
      border-radius: 16px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 
        0 10px 30px rgba(186, 225, 255, 0.3),
        0 2px 8px rgba(186, 225, 255, 0.2);
      transform-style: preserve-3d;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px) rotateX(2deg);
        box-shadow: 
          0 15px 35px rgba(186, 225, 255, 0.4),
          0 3px 10px rgba(186, 225, 255, 0.3);
      }

      mat-card-header {
        background: linear-gradient(135deg, rgba(186, 225, 255, 0.2), rgba(255, 255, 255, 0.95));
        padding: 1.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(186, 225, 255, 0.5);
        backdrop-filter: blur(8px);

        mat-card-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 500;
          color: #009bda;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
      }

      mat-card-content {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.7);
      }
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;

      ::ng-deep {
        .mat-mdc-form-field-flex {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(4px);
          border-radius: 8px;
          border: 1px solid rgba(186, 225, 255, 0.5);
        }

        .mat-mdc-text-field-wrapper {
          background: transparent;
        }

        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 8px;
        }
      }
    }

    .documents-list, .news-list, .squads-list, .events-list, .milestones-list, .leadership-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .document-item, .news-item, .squad-item, .event-item, .milestone-item, .leader-item {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
        border-radius: 12px;
        align-items: start;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(186, 225, 255, 0.5);
        box-shadow: 
          0 4px 15px rgba(186, 225, 255, 0.3),
          0 1px 5px rgba(186, 225, 255, 0.2);
        transform-style: preserve-3d;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 
            0 8px 20px rgba(186, 225, 255, 0.4),
            0 2px 8px rgba(186, 225, 255, 0.3);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9));
        }

        button {
          align-self: center;
          transform: translateZ(10px);
        }
      }

      button[mat-raised-button] {
        margin-top: 1rem;
        background: linear-gradient(135deg, #009bda, #00b4db);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        box-shadow: 
          0 4px 15px rgba(0, 155, 218, 0.2),
          0 1px 5px rgba(0, 155, 218, 0.1);
        transform-style: preserve-3d;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px) translateZ(5px);
          box-shadow: 
            0 6px 20px rgba(0, 155, 218, 0.3),
            0 2px 8px rgba(0, 155, 218, 0.2);
          background: linear-gradient(135deg, #00b4db, #009bda);
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .editor-info {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: start;
      transform-style: preserve-3d;
    }

    .image-upload, .document-upload {
      input[type="file"] {
        display: none;
      }

      button {
        width: 100%;
        background: linear-gradient(135deg, rgba(186, 225, 255, 0.2), rgba(255, 255, 255, 0.9));
        backdrop-filter: blur(4px);
        border: 1px solid rgba(186, 225, 255, 0.5);
        transform-style: preserve-3d;
        transition: all 0.3s ease;
        color: #009bda;

        &:hover {
          background: linear-gradient(135deg, rgba(186, 225, 255, 0.3), rgba(255, 255, 255, 0.95));
          transform: translateY(-2px) translateZ(5px);
          box-shadow: 
            0 4px 15px rgba(186, 225, 255, 0.3),
            0 1px 5px rgba(186, 225, 255, 0.2);
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(186, 225, 255, 0.5);
      box-shadow: 
        0 10px 30px rgba(186, 225, 255, 0.3),
        0 2px 8px rgba(186, 225, 255, 0.2);
      transform-style: preserve-3d;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px) rotateX(2deg);
        box-shadow: 
          0 15px 35px rgba(186, 225, 255, 0.4),
          0 3px 10px rgba(186, 225, 255, 0.3);
      }

      button {
        min-width: 150px;
        background: linear-gradient(135deg, #009bda, #00b4db);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        transform-style: preserve-3d;
        transition: all 0.3s ease;

        &:hover:not([disabled]) {
          transform: translateY(-2px) translateZ(5px);
          box-shadow: 
            0 8px 20px rgba(0, 155, 218, 0.3),
            0 2px 8px rgba(0, 155, 218, 0.2);
          background: linear-gradient(135deg, #00b4db, #009bda);
        }

        &[disabled] {
          background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
          color: #999;
          opacity: 0.7;
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    // Custom scrollbar for a more polished look
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(186, 225, 255, 0.2);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 155, 218, 0.2);
      border-radius: 4px;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(186, 225, 255, 0.5);

      &:hover {
        background: rgba(0, 155, 218, 0.3);
      }
    }

    @media (max-width: 768px) {
      .programs-edit {
        padding: 1rem;
      }

      .form-section {
        margin-bottom: 1.5rem;
        border-radius: 12px;

        mat-card-header {
          padding: 1rem;
        }

        mat-card-content {
          padding: 1rem;
        }
      }

      .document-item, .news-item, .squad-item, .event-item, .milestone-item, .leader-item {
        grid-template-columns: 1fr !important;
        padding: 1rem;
      }

      .editor-info {
        grid-template-columns: 1fr !important;
      }

      .form-actions {
        padding: 1rem;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ProgramsEditComponent implements OnInit {
  programForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fleetService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.programForm = this.fb.group({
      title: ['', Validators.required],
      missionStatement: ['', Validators.required],
      description: ['', Validators.required],
      roadmapType: ['text'],
      roadmapImage: [''],
      milestones: this.fb.array([]),
      documents: this.fb.array([]),
      news: this.fb.array([]),
      squads: this.fb.array([]),
      events: this.fb.array([]),
      leadership: this.fb.array([])
    });
  }

  ngOnInit() {
    // Load initial data with comprehensive sample data
    const programData = {
      title: 'Fleet Management Excellence Program',
      missionStatement: 'To revolutionize fleet management through innovative programs that enhance efficiency, sustainability, and safety while delivering exceptional value to our stakeholders. We aim to set new industry standards through digital transformation and sustainable practices.',
      description: 'Our Fleet Management Excellence Program represents a comprehensive approach to modernizing and optimizing fleet operations. Through strategic initiatives, cutting-edge technology implementation, and continuous improvement processes, we aim to transform traditional fleet management into a data-driven, sustainable, and highly efficient operation. This program encompasses multiple initiatives across various domains including sustainability, safety, efficiency, and digital transformation.',
      roadmapType: 'text',
      milestones: [
        {
          date: new Date('2024-01'),
          title: 'Program Initiation & Planning Phase',
          description: 'Launch of core fleet management initiatives and establishment of baseline metrics'
        },
        {
          date: new Date('2024-03'),
          title: 'Digital Infrastructure Setup',
          description: 'Implementation of core digital systems and IoT infrastructure'
        },
        {
          date: new Date('2024-06'),
          title: 'Technology Integration Phase',
          description: 'Implementation of advanced fleet tracking systems and AI-powered analytics'
        },
        {
          date: new Date('2024-09'),
          title: 'Sustainability Initiative Launch',
          description: 'Introduction of electric vehicles and renewable energy solutions'
        },
        {
          date: new Date('2024-12'),
          title: 'Expansion & Optimization Phase',
          description: 'Scaling operations and expanding program scope to additional regions'
        }
      ],
      leadership: [
        {
          name: 'Sarah Johnson',
          position: 'Program Director',
          contact: 'sarah.j@example.com',
          image: 'assets/images/leader1.jpg'
        },
        {
          name: 'Michael Chen',
          position: 'Technical Lead',
          contact: 'michael.c@example.com',
          image: 'assets/images/leader2.jpg'
        },
        {
          name: 'Emily Rodriguez',
          position: 'Sustainability Manager',
          contact: 'emily.r@example.com',
          image: 'assets/images/leader3.jpg'
        }
      ],
      documents: [
        {
          name: 'Fleet Optimization Strategy 2024',
          squad: 'Operations Squad',
          editor: {
            name: 'John Doe',
            image: 'assets/images/user1.jpg'
          },
          thumbnail: 'assets/images/doc1.jpg',
          editedAt: new Date('2024-01-15')
        },
        {
          name: 'Sustainability Implementation Plan',
          squad: 'Green Initiative Squad',
          editor: {
            name: 'Lisa Wong',
            image: 'assets/images/user2.jpg'
          },
          thumbnail: 'assets/images/doc2.jpg',
          editedAt: new Date('2024-01-10')
        },
        {
          name: 'Digital Transformation Roadmap',
          squad: 'Tech Innovation Squad',
          editor: {
            name: 'Alex Kumar',
            image: 'assets/images/user3.jpg'
          },
          thumbnail: 'assets/images/doc3.jpg',
          editedAt: new Date('2024-01-05')
        },
        {
          name: 'Safety Protocol Guidelines',
          squad: 'Safety & Compliance Squad',
          editor: {
            name: 'Maria Garcia',
            image: 'assets/images/user4.jpg'
          },
          thumbnail: 'assets/images/doc4.jpg',
          editedAt: new Date('2024-01-01')
        }
      ],
      news: [
        {
          title: 'New Fleet Management System Successfully Launched',
          description: 'Successfully implemented the latest AI-powered fleet tracking technology, enabling real-time monitoring and predictive maintenance capabilities.',
          date: new Date('2024-01-15'),
          link: '#'
        },
        {
          title: 'Sustainability Milestone Achieved',
          description: 'Program reaches 25% electric vehicle integration target ahead of schedule, marking a significant step towards our sustainability goals.',
          date: new Date('2024-01-10'),
          link: '#'
        },
        {
          title: 'Digital Transformation Initiative Kicks Off',
          description: 'Launch of comprehensive digital transformation project to modernize fleet operations and enhance efficiency.',
          date: new Date('2024-01-05'),
          link: '#'
        },
        {
          title: 'Safety First Campaign Launched',
          description: 'Introduction of new safety protocols and training programs to enhance fleet safety standards.',
          date: new Date('2024-01-01'),
          link: '#'
        }
      ],
      squads: [
        {
          name: 'Operations Squad',
          description: 'Focused on day-to-day fleet operations optimization and efficiency improvements',
          members: 8,
          progress: 75
        },
        {
          name: 'Tech Innovation Squad',
          description: 'Leading digital transformation and technology integration initiatives',
          members: 6,
          progress: 60
        },
        {
          name: 'Green Initiative Squad',
          description: 'Driving sustainability and environmental impact reduction programs',
          members: 5,
          progress: 45
        },
        {
          name: 'Safety & Compliance Squad',
          description: 'Ensuring adherence to safety standards and regulatory requirements',
          members: 7,
          progress: 80
        }
      ],
      events: [
        {
          title: 'Q1 Program Review',
          date: new Date('2024-03-15'),
          description: 'Quarterly progress review and strategic planning meeting',
          type: 'Review Meeting'
        },
        {
          title: 'Digital Transformation Workshop',
          date: new Date('2024-02-20'),
          description: 'Hands-on workshop for new digital tools and systems',
          type: 'Workshop'
        },
        {
          title: 'Sustainability Summit',
          date: new Date('2024-02-10'),
          description: 'Discussion of green initiatives and environmental goals',
          type: 'Conference'
        },
        {
          title: 'Safety Training Session',
          date: new Date('2024-02-05'),
          description: 'Mandatory safety protocols and procedures training',
          type: 'Training'
        },
        {
          title: 'Innovation Hackathon',
          date: new Date('2024-01-25'),
          description: 'Team event to develop innovative solutions for fleet management',
          type: 'Team Event'
        }
      ]
    };

    this.setFormValues(programData);
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
      name: ['', Validators.required],
      position: ['', Validators.required],
      contact: ['', [Validators.required, Validators.email]],
      image: ['']
    });

    this.leadership.push(leader);
  }

  removeLeader(index: number) {
    this.leadership.removeAt(index);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      this.programForm.patchValue({
        roadmapImage: file
      });
    }
  }

  onLeaderImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Handle leader image upload logic here
      const leader = this.leadership.at(index);
      leader.patchValue({
        image: file
      });
    }
  }

  addDocument() {
    const document = this.fb.group({
      name: ['', Validators.required],
      squad: ['', Validators.required],
      editorName: ['', Validators.required],
      editorImage: [''],
      thumbnail: [''],
      editedAt: [new Date()]
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

  onEditorImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const document = this.documents.at(index);
      document.patchValue({
        editorImage: file
      });
    }
  }

  onDocumentThumbnailSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const document = this.documents.at(index);
      document.patchValue({
        thumbnail: file
      });
    }
  }

  setFormValues(data: any) {
    this.programForm.patchValue({
      title: data.title,
      missionStatement: data.missionStatement,
      description: data.description,
      roadmapType: data.roadmapType
    });

    // Clear all arrays
    ['milestones', 'leadership', 'documents', 'news', 'squads', 'events'].forEach(arrayName => {
      const formArray = this.programForm.get(arrayName) as FormArray;
      while (formArray.length) {
        formArray.removeAt(0);
      }
    });

    // Set new values
    data.documents?.forEach((doc: any) => {
      this.documents.push(this.fb.group({
        name: [doc.name],
        squad: [doc.squad],
        editorName: [doc.editor.name],
        editorImage: [doc.editor.image],
        thumbnail: [doc.thumbnail],
        editedAt: [doc.editedAt]
      }));
    });

    data.news?.forEach((item: any) => {
      this.news.push(this.fb.group({
        title: [item.title],
        description: [item.description],
        link: [item.link],
        date: [item.date]
      }));
    });

    data.squads?.forEach((squad: any) => {
      this.squads.push(this.fb.group({
        name: [squad.name],
        description: [squad.description],
        members: [squad.members],
        progress: [squad.progress]
      }));
    });

    data.events?.forEach((event: any) => {
      this.events.push(this.fb.group({
        title: [event.title],
        description: [event.description],
        type: [event.type],
        date: [event.date]
      }));
    });

    // Previous arrays (milestones and leadership) setting logic remains unchanged
    data.milestones?.forEach((milestone: any) => {
      this.milestones.push(this.fb.group({
        date: [milestone.date],
        title: [milestone.title],
        description: [milestone.description]
      }));
    });

    data.leadership?.forEach((leader: any) => {
      this.leadership.push(this.fb.group({
        name: [leader.name],
        position: [leader.position],
        contact: [leader.contact],
        image: [leader.image]
      }));
    });
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