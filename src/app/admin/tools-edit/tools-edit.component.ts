import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FleetDataService } from '../../services/fleet-management.service';

@Component({
  selector: 'app-tools-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="admin-tools-container">
      <!-- Intro Section -->
      <div class="glass-container intro-section">
        <form [formGroup]="introForm" class="intro-form">
          <mat-form-field appearance="outline" class="title-field">
            <mat-label>Page Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter page title">
          </mat-form-field>

          <mat-form-field appearance="outline" class="description-field">
            <mat-label>Page Description</mat-label>
            <textarea matInput formControlName="description" 
                      placeholder="Enter page description" rows="3">
            </textarea>
          </mat-form-field>

          <button mat-raised-button color="primary" 
                  (click)="saveIntro()"
                  [disabled]="!introForm.valid">
            <mat-icon>save</mat-icon>
            Save Intro
          </button>
        </form>
      </div>

      <!-- Tools Edit Form -->
      <div class="glass-container">
        <form [formGroup]="toolsForm" class="tools-form">
          <div formArrayName="tools">
            <div *ngFor="let tool of toolsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="tool-edit-card"
                 [ngClass]="'color-' + (i % 3 + 1)">
              
              <div class="card-header">
                <mat-form-field appearance="outline" class="header-title">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="sectionTitle" 
                         placeholder="Enter section title">
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeTool(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Tool Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter tool name">
                  <mat-error *ngIf="tool.get('name')?.hasError('required')">
                    Tool name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" 
                            placeholder="Enter tool description" rows="3">
                  </textarea>
                  <mat-error *ngIf="tool.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Color Theme</mat-label>
                  <input matInput formControlName="color" type="color">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tool Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter tool link">
                  <mat-error *ngIf="tool.get('link')?.hasError('required')">
                    Tool link is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Documentation Link</mat-label>
                  <input matInput formControlName="documentation" placeholder="Enter documentation link">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Managing Squad</mat-label>
                  <mat-select formControlName="squad">
                    <mat-option value="Fleet Operations Squad">Fleet Operations Squad</mat-option>
                    <mat-option value="Technical Squad">Technical Squad</mat-option>
                    <mat-option value="Innovation Squad">Innovation Squad</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="features-section" formArrayName="features">
                  <h3>Key Features</h3>
                  <div class="features-list">
                    <div *ngFor="let feature of getFeatures(i).controls; let j = index">
                      <mat-form-field appearance="outline">
                        <mat-label>Feature {{j + 1}}</mat-label>
                        <input matInput [formControlName]="j" placeholder="Enter feature">
                        <button mat-icon-button matSuffix color="warn" 
                                (click)="removeFeature(i, j)" type="button">
                          <mat-icon>remove_circle</mat-icon>
                        </button>
                      </mat-form-field>
                    </div>
                  </div>
                  <button mat-stroked-button color="primary" 
                          (click)="addFeature(i)" type="button">
                    <mat-icon>add</mat-icon>
                    Add Feature
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" 
                    (click)="addTool()" type="button">
              <mat-icon>add</mat-icon>
              Add New Tool
            </button>
            <button mat-raised-button color="accent" 
                    (click)="saveTools()" 
                    [disabled]="!toolsForm.valid">
              <mat-icon>save</mat-icon>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-tools-container {
      padding: 2rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .glass-container {
      background: var(--card-bg, rgba(255, 255, 255, 0.9));
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .intro-section {
      .intro-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;

        .title-field {
          width: 100%;
          max-width: 600px;
          
          input {
            font-size: 2rem;
            font-weight: 600;
            color: #009bda;
            text-align: center;
          }
        }

        .description-field {
          width: 100%;
          max-width: 800px;

          textarea {
            font-size: 1.2rem;
            line-height: 1.6;
            text-align: center;
          }
        }

        button {
          margin-top: 1rem;
          min-width: 150px;
        }
      }
    }

    .tools-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .tool-edit-card {
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 2rem;
      transition: all 0.3s ease;

      &.color-1 {
        background: linear-gradient(135deg, #bae1ff33 0%, #ffffff 100%);
        .card-header { background: #bae1ff40; }
      }

      &.color-2 {
        background: linear-gradient(135deg, #baffc933 0%, #ffffff 100%);
        .card-header { background: #baffc940; }
      }

      &.color-3 {
        background: linear-gradient(135deg, #ffdfba33 0%, #ffffff 100%);
        .card-header { background: #ffdfba40; }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        .header-title {
          flex: 1;
          margin-right: 1rem;
          
          input {
            font-size: 1.8rem;
            font-weight: 300;
            color: #1a237e;
          }
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 2rem;

      mat-form-field {
        width: 100%;
      }

      .features-section {
        grid-column: 1 / -1;
        background: rgba(255, 255, 255, 0.5);
        padding: 1.5rem;
        border-radius: 8px;

        h3 {
          color: #1a237e;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1rem 0;

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .admin-tools-container {
        padding: 1rem;
      }

      .glass-container {
        padding: 1rem;
      }
    }
  `]
})
export class ToolsEditComponent implements OnInit {
  toolsForm: FormGroup;
  introForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fleetService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.toolsForm = this.fb.group({
      tools: this.fb.array([])
    });

    this.introForm = this.fb.group({
      title: ['Tools Management', Validators.required],
      description: ['Manage and update the fleet management tools. Add new tools, edit existing ones, or remove outdated tools.', Validators.required]
    });
  }

  ngOnInit() {
    const currentTools = this.fleetService.getFleetData()().tools;
    currentTools.forEach((tool: any) => {
      this.addTool(tool);
    });
  }

  get toolsArray() {
    return this.toolsForm.get('tools') as FormArray;
  }

  getFeatures(toolIndex: number): FormArray {
    return this.toolsArray.at(toolIndex).get('features') as FormArray;
  }

  addTool(tool?: any) {
    const toolGroup = this.fb.group({
      sectionTitle: [tool?.sectionTitle || `Tool ${this.toolsArray.length + 1}`, Validators.required],
      name: [tool?.name || '', Validators.required],
      description: [tool?.description || '', Validators.required],
      color: [tool?.color || '#bae1ff', Validators.required],
      link: [tool?.link || '', Validators.required],
      documentation: [tool?.documentation || ''],
      squad: [tool?.squad || 'Fleet Operations Squad', Validators.required],
      features: this.fb.array(
        tool?.features ? 
          tool.features.map((f: string) => this.fb.control(f)) : 
          [this.fb.control('')]
      )
    });

    this.toolsArray.push(toolGroup);
  }

  addFeature(toolIndex: number) {
    const features = this.getFeatures(toolIndex);
    features.push(this.fb.control(''));
  }

  removeFeature(toolIndex: number, featureIndex: number) {
    const features = this.getFeatures(toolIndex);
    features.removeAt(featureIndex);
  }

  removeTool(index: number) {
    this.toolsArray.removeAt(index);
  }

  saveIntro() {
    if (this.introForm.valid) {
      const currentData = this.fleetService.getFleetData()();
      const updatedData = {
        ...currentData,
        toolsIntro: this.introForm.value
      };
      
      this.fleetService.getFleetData().set(updatedData);
      
      this.snackBar.open('Tools intro updated successfully', 'Close', {
        duration: 3000
      });
    }
  }

  saveTools() {
    if (this.toolsForm.valid) {
      const currentData = this.fleetService.getFleetData()();
      const updatedData = {
        ...currentData,
        tools: this.toolsForm.value.tools
      };
      
      this.fleetService.getFleetData().set(updatedData);
      
      this.snackBar.open('Tools updated successfully', 'Close', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
} 