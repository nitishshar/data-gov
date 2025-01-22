import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatIconModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <div class="page-header">
          <h1>Edit Squad Details</h1>
          <p class="subtitle">Update the information for your squad</p>
        </div>

        <form [formGroup]="squadForm" (ngSubmit)="saveSquadDetails()">
          <mat-card class="form-card">
            <mat-card-content>
              <div class="form-fields">
                <mat-form-field appearance="outline">
                  <mat-label>Squad Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter squad name">
                  <mat-error *ngIf="squadForm.get('name')?.hasError('required')">
                    Squad name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="4" placeholder="Enter description"></textarea>
                  <mat-error *ngIf="squadForm.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Leader</mat-label>
                  <input matInput formControlName="leader" placeholder="Enter leader name">
                  <mat-error *ngIf="squadForm.get('leader')?.hasError('required')">
                    Leader name is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>

            <mat-card-actions class="form-actions">
              <button mat-stroked-button type="button">Cancel</button>
              <button mat-flat-button color="primary" type="submit">Save Changes</button>
            </mat-card-actions>
          </mat-card>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100%;
      background: #f5f5f5;
    }

    .content-wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #1976d2;
      }

      .subtitle {
        margin: 8px 0 0;
        color: #666;
      }
    }

    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      }
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mat-mdc-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }

    :host ::ng-deep .mat-mdc-form-field:hover .mat-mdc-text-field-wrapper {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    :host ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      box-shadow: 0 6px 12px rgba(25,118,210,0.1);
      transform: translateY(-2px);
    }

    :host ::ng-deep .mat-mdc-form-field-outline {
      border-radius: 8px;
    }

    :host ::ng-deep .mat-mdc-floating-label {
      font-size: 15px;
      color: #2c3e50;
    }

    :host ::ng-deep .mat-mdc-input-element {
      font-size: 15px;
      color: #2c3e50;
    }

    .form-actions {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #e0e0e0;
    }

    button[mat-flat-button] {
      height: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      }
    }
  `]
})
export class SquadDetailsEditComponent implements OnInit {
  squadForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadSquadDetails();
  }

  private initForm() {
    this.squadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      leader: ['', Validators.required]
    });
  }

  private loadSquadDetails() {
    // Replace with your actual API endpoint
    this.http.get('/api/squad-details').subscribe({
      next: (data: any) => {
        this.squadForm.patchValue(data);
      },
      error: () => {
        this.snackBar.open('Failed to load squad details', 'Close', { duration: 3000 });
      }
    });
  }

  saveSquadDetails() {
    if (this.squadForm.valid) {
      // Replace with your actual API endpoint
      this.http.post('/api/squad-details', this.squadForm.value).subscribe({
        next: () => {
          this.snackBar.open('Squad details updated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to update squad details', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 