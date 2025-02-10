import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { FleetDataService } from '../../services/fleet-management.service';

interface Tool {
  id: string;
  name: string;
  description: string;
  squad: string;
  color: string;
  link: string;
  documentation?: string;
  support: {
    type: 'text' | 'link';
    content: string;
  };
  features: string[];
  technicalDetails: string[];
}

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
    MatSelectModule,
    MatExpansionModule
  ],
  template: `
    <div class="tools-edit">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>{{ selectedToolTitle || 'Tools Administration' }}</mat-card-title>
          <mat-card-subtitle>Manage and customize your tools details</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <form [formGroup]="toolForm" (ngSubmit)="saveTool()">
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
              <mat-label>Select Tool</mat-label>
              <mat-select formControlName="toolId" (selectionChange)="onToolSelect($event)">
                <mat-option *ngFor="let tool of availableTools" [value]="tool.id">
                  {{tool.id}} - {{tool.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tool Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter tool name">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Enter description"></textarea>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Squad</mat-label>
              <mat-select formControlName="squad">
                <mat-option *ngFor="let squad of availableSquads" [value]="squad.id">
                  {{squad.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Color</mat-label>
              <input matInput formControlName="color" type="color">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Link</mat-label>
              <input matInput formControlName="link" placeholder="Enter tool link">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Documentation</mat-label>
              <input matInput formControlName="documentation" placeholder="Enter documentation link">
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <!-- Support Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>support</mat-icon>
              Support Information
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div formGroupName="support">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="text">Text</mat-option>
                  <mat-option value="link">Link</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Content</mat-label>
                <textarea matInput formControlName="content" rows="4" placeholder="Enter support content"></textarea>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Features Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>featured_play_list</mat-icon>
              Features
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addFeature()">
                <mat-icon>add</mat-icon>
                Add Feature
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="features">
            <div *ngFor="let feature of features.controls; let i = index" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Feature</mat-label>
                  <input matInput [formControlName]="i" placeholder="Enter feature">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeFeature(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Technical Details Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>code</mat-icon>
              Technical Details
            </mat-panel-title>
            <mat-panel-description>
              <button mat-raised-button color="primary" type="button" (click)="$event.stopPropagation(); addTechnicalDetail()">
                <mat-icon>add</mat-icon>
                Add Detail
              </button>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div formArrayName="technicalDetails">
            <div *ngFor="let detail of technicalDetails.controls; let i = index" class="array-item">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Technical Detail</mat-label>
                  <input matInput [formControlName]="i" placeholder="Enter technical detail">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeTechnicalDetail(i)">
                  <mat-icon>delete</mat-icon>
                </button>
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
    .tools-edit {
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
      .tools-edit {
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
export class ToolsEditComponent implements OnInit {
  toolForm!: FormGroup;
  availableTools: Tool[] = [];
  availableSquads: any[] = [];
  selectedToolTitle: string = '';

  constructor(
    private fb: FormBuilder,
    private fleetService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadTools();
    this.loadSquads();
  }

  private initForm() {
    this.toolForm = this.fb.group({
      toolId: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      squad: ['', Validators.required],
      color: ['#bae1ff', Validators.required],
      link: ['', Validators.required],
      documentation: [''],
      support: this.fb.group({
        type: ['text', Validators.required],
        content: ['', Validators.required]
      }),
      features: this.fb.array([]),
      technicalDetails: this.fb.array([])
    });
  }

  private loadTools() {
    const fleetData = this.fleetService.getFleetData()();
    if (fleetData?.tools) {
      this.availableTools = fleetData.tools as Tool[];
    }
  }

  private loadSquads() {
    const fleetData = this.fleetService.getFleetData()();
    if (fleetData?.squads) {
      this.availableSquads = fleetData.squads;
    }
  }

  onToolSelect(event: any) {
    const selectedTool = this.availableTools.find(tool => tool.id === event.value);
    if (selectedTool) {
      this.selectedToolTitle = `Tool: ${selectedTool.name}`;
      this.toolForm.patchValue({
        name: selectedTool.name,
        description: selectedTool.description,
        squad: selectedTool.squad,
        color: selectedTool.color,
        link: selectedTool.link,
        documentation: selectedTool.documentation,
        support: selectedTool.support
      });

      // Clear existing arrays
      this.features.clear();
      this.technicalDetails.clear();

      // Add new values
      selectedTool.features?.forEach((feature: string) => {
        this.features.push(this.fb.control(feature));
      });

      selectedTool.technicalDetails?.forEach((detail: string) => {
        this.technicalDetails.push(this.fb.control(detail));
      });
    }
  }

  get features() {
    return this.toolForm.get('features') as FormArray;
  }

  get technicalDetails() {
    return this.toolForm.get('technicalDetails') as FormArray;
  }

  addFeature() {
    this.features.push(this.fb.control(''));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  addTechnicalDetail() {
    this.technicalDetails.push(this.fb.control(''));
  }

  removeTechnicalDetail(index: number) {
    this.technicalDetails.removeAt(index);
  }

  saveTool() {
    if (this.toolForm.valid) {
      const currentData = this.fleetService.getFleetData()();
      const toolIndex = (currentData.tools as any[]).findIndex(t => t?.id === this.toolForm.value.toolId);
      
      if (toolIndex !== -1) {
        const updatedTool: Tool = {
          id: this.toolForm.value.toolId,
          name: this.toolForm.value.name,
          description: this.toolForm.value.description,
          squad: this.toolForm.value.squad,
          color: this.toolForm.value.color,
          link: this.toolForm.value.link,
          documentation: this.toolForm.value.documentation,
          support: this.toolForm.value.support,
          features: this.toolForm.value.features,
          technicalDetails: this.toolForm.value.technicalDetails
        };
        
        const updatedTools = [
          ...currentData.tools.slice(0, toolIndex),
          updatedTool,
          ...currentData.tools.slice(toolIndex + 1)
        ];

        this.fleetService.getFleetData().set({
          ...currentData,
          tools: updatedTools
        });
        
        this.snackBar.open('Tool updated successfully', 'Close', {
          duration: 3000
        });
      }
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
} 