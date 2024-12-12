import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



interface LandingPageData {
  name: string;
  missionStatement: string;
  objectives: string[];
  leadership: {
    name: string;
    title: string;
    email: string;
    department: string;
  }[];
}

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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-page">
      <div class="form-container">
        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>Landing Page Settings</mat-card-title>
            <mat-card-subtitle>Manage your landing page content and information</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="landingPageForm" (ngSubmit)="saveLandingPage()">
              <!-- Basic Information Section -->
              <div class="form-section">
                <h3>Basic Information</h3>
                <div class="section-content">
                  <mat-form-field appearance="outline">
                    <mat-label>Fleet Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter fleet name">
                    <mat-error *ngIf="landingPageForm.get('name')?.hasError('required')">
                      Fleet name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Mission Statement</mat-label>
                    <textarea matInput formControlName="missionStatement" 
                              rows="4" 
                              placeholder="Enter your mission statement"></textarea>
                    <mat-error *ngIf="landingPageForm.get('missionStatement')?.hasError('required')">
                      Mission statement is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Objectives Section -->
              <div class="form-section">
                <div class="section-header">
                  <h3>Objectives</h3>
                  <button mat-flat-button color="primary" type="button" (click)="addObjective()">
                    <mat-icon>add</mat-icon>
                    Add Objective
                  </button>
                </div>
                
                <div class="section-content" formArrayName="objectives">
                  <div *ngFor="let objective of objectivesArray.controls; let i=index" 
                       class="objective-item">
                    <mat-form-field appearance="outline">
                      <mat-label>Objective {{i + 1}}</mat-label>
                      <input matInput [formControlName]="i" placeholder="Enter objective">
                      <button mat-icon-button matSuffix color="warn" type="button" 
                              (click)="removeObjective(i)" class="remove-button">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </mat-form-field>
                  </div>
                </div>
              </div>

              <!-- Leadership Section -->
              <div class="form-section">
                <div class="section-header">
                  <h3>Leadership</h3>
                  <button mat-flat-button color="primary" type="button" (click)="addLeader()">
                    <mat-icon>person_add</mat-icon>
                    Add Leader
                  </button>
                </div>
                
                <div class="section-content" formArrayName="leadership">
                  <div *ngFor="let leader of leadershipArray.controls; let i=index" 
                       [formGroupName]="i" 
                       class="leader-card">
                    <div class="card-header">
                      <h4>Leader {{i + 1}}</h4>
                      <button mat-icon-button color="warn" type="button" 
                              (click)="removeLeader(i)" class="remove-button">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                    
                    <div class="card-content">
                      <mat-form-field appearance="outline">
                        <mat-label>Name</mat-label>
                        <input matInput formControlName="name" placeholder="Enter name">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Title</mat-label>
                        <input matInput formControlName="title" placeholder="Enter title">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="Enter email">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Department</mat-label>
                        <input matInput formControlName="department" placeholder="Enter department">
                      </mat-form-field>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button">Cancel</button>
                <button mat-flat-button color="primary" type="submit">Save Changes</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .admin-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      padding: 24px 24px 0;
      margin-bottom: 24px;
      border-bottom: 1px solid #eee;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
      color: #1976d2;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 14px;
    }

    .form-section {
      margin-bottom: 32px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 24px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #2c3e50;
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      button {
        gap: 8px;
      }
    }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mat-mdc-form-field {
      width: 100%;
    }

    .objective-item {
      position: relative;
      
      .remove-button {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }

    .leader-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #2c3e50;
        }
      }
      
      .card-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    // Material Design elevation on hover
    .leader-card {
      transition: box-shadow 0.3s ease-in-out;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .admin-page {
        padding: 16px;
      }
      
      .form-section {
        padding: 16px;
      }
      
      .leader-card .card-content {
        grid-template-columns: 1fr;
      }
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  `]
})
export class LandingPageAdminComponent implements OnInit {
  landingPageForm!: FormGroup;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    // For testing
    this.loadMockData();
    
    // When ready for production, use:
    // this.loadExistingData();
  }

  get objectivesArray() {
    return this.landingPageForm.get('objectives') as FormArray;
  }

  get leadershipArray() {
    return this.landingPageForm.get('leadership') as FormArray;
  }

  private initForm() {
    this.landingPageForm = this.fb.group({
      name: ['', Validators.required],
      missionStatement: ['', Validators.required],
      objectives: this.fb.array([]),
      leadership: this.fb.array([])
    });
  }

  private loadExistingData() {
    this.isLoading = true;
    // Replace with your actual API endpoint
    this.http.get<LandingPageData>('/api/landing-page').subscribe({
      next: (data) => {
        // Clear existing form arrays
        while (this.objectivesArray.length) {
          this.objectivesArray.removeAt(0);
        }
        while (this.leadershipArray.length) {
          this.leadershipArray.removeAt(0);
        }

        // Set basic fields
        this.landingPageForm.patchValue({
          name: data.name,
          missionStatement: data.missionStatement
        });

        // Add objectives
        data.objectives?.forEach(objective => {
          this.objectivesArray.push(this.fb.control(objective));
        });

        // Add leadership
        data.leadership?.forEach(leader => {
          this.leadershipArray.push(
            this.fb.group({
              name: [leader.name, Validators.required],
              title: [leader.title, Validators.required],
              email: [leader.email, [Validators.required, Validators.email]],
              department: [leader.department]
            })
          );
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading landing page data:', error);
        this.snackBar.open('Error loading data. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  // For testing/development - remove in production
  private loadMockData() {
    const mockData: LandingPageData = {
      name: "Fleet Innovation Team",
      missionStatement: "Driving innovation and excellence in fleet management",
      objectives: [
        "Implement cutting-edge fleet management solutions",
        "Optimize operational efficiency",
        "Enhance fleet safety and compliance"
      ],
      leadership: [
        {
          name: "John Doe",
          title: "Fleet Director",
          email: "john.doe@company.com",
          department: "Fleet Operations"
        },
        {
          name: "Jane Smith",
          title: "Innovation Lead",
          email: "jane.smith@company.com",
          department: "Technology"
        }
      ]
    };

    // Simulate API delay
    setTimeout(() => {
      this.patchFormWithData(mockData);
      this.isLoading = false;
    }, 1000);
  }

  private patchFormWithData(data: LandingPageData) {
    // Clear existing arrays
    while (this.objectivesArray.length) {
      this.objectivesArray.removeAt(0);
    }
    while (this.leadershipArray.length) {
      this.leadershipArray.removeAt(0);
    }

    // Set basic fields
    this.landingPageForm.patchValue({
      name: data.name,
      missionStatement: data.missionStatement
    });

    // Add objectives
    data.objectives.forEach(objective => {
      this.objectivesArray.push(this.fb.control(objective));
    });

    // Add leadership
    data.leadership.forEach(leader => {
      this.leadershipArray.push(
        this.fb.group({
          name: [leader.name, Validators.required],
          title: [leader.title, Validators.required],
          email: [leader.email, [Validators.required, Validators.email]],
          department: [leader.department]
        })
      );
    });
  }

  addObjective() {
    this.objectivesArray.push(this.fb.control('', Validators.required));
  }

  removeObjective(index: number) {
    this.objectivesArray.removeAt(index);
  }

  addLeader() {
    this.leadershipArray.push(
      this.fb.group({
        name: ['', Validators.required],
        title: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        department: ['']
      })
    );
  }

  removeLeader(index: number) {
    this.leadershipArray.removeAt(index);
  }

  saveLandingPage() {
    if (this.landingPageForm.valid) {
      this.http.post('/api/landing-page', this.landingPageForm.value).subscribe({
        next: () => {
          this.snackBar.open('Changes saved successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error saving changes', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 