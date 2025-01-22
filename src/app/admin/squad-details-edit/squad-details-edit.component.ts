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
    MatSelectModule
  ],
  template: `
    <div class="squad-details-edit">
      <form [formGroup]="squadForm" (ngSubmit)="saveSquadDetails()">
        <div formArrayName="squads">
          <div *ngFor="let squad of squads.controls; let i = index" [formGroupName]="i">
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Squad Details</mat-card-title>
                <button mat-icon-button color="warn" type="button" (click)="removeSquad(i)" *ngIf="squads.length > 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline">
                  <mat-label>Squad Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter squad name">
                  <mat-error *ngIf="squad.get('name')?.hasError('required')">
                    Squad name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="4" placeholder="Enter description"></textarea>
                  <mat-error *ngIf="squad.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Leader</mat-label>
                  <input matInput formControlName="leader" placeholder="Enter leader name">
                  <mat-error *ngIf="squad.get('leader')?.hasError('required')">
                    Leader name is required
                  </mat-error>
                </mat-form-field>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="addSquad()">
            <mat-icon>add</mat-icon>
            Add Squad
          </button>
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

    .squad-details-edit {
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
        display: flex;
        justify-content: space-between;
        align-items: center;

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

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

      .action-buttons {
        display: flex;
        gap: 1rem;
      }

      button {
        min-width: 120px;
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
        transform-style: preserve-3d;
        transition: all 0.3s ease;

        &[color="primary"] {
          background: linear-gradient(135deg, #009bda, #00b4db);
          color: white;

          &:hover {
            transform: translateY(-2px) translateZ(5px);
            box-shadow: 
              0 8px 20px rgba(0, 155, 218, 0.3),
              0 2px 8px rgba(0, 155, 218, 0.2);
            background: linear-gradient(135deg, #00b4db, #009bda);
          }
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    // Custom scrollbar
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
      .squad-details-edit {
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

      .form-actions {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        
        .action-buttons {
          width: 100%;
          flex-direction: column;
        }

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class SquadDetailsEditComponent implements OnInit {
  squadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.squadForm = this.fb.group({
      squads: this.fb.array([])
    });
  }

  ngOnInit() {
    this.addSquad();
  }

  get squads() {
    return this.squadForm.get('squads') as FormArray;
  }

  createSquadGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      leader: ['', Validators.required]
    });
  }

  addSquad() {
    this.squads.push(this.createSquadGroup());
  }

  removeSquad(index: number) {
    this.squads.removeAt(index);
  }

  saveSquadDetails() {
    if (this.squadForm.valid) {
      // Replace with your actual API endpoint
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
    }
  }
} 