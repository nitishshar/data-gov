import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FleetDataService } from '../../services/fleet-management.service';

@Component({
  selector: 'app-tools-management',
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
    <div class="tools-management">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Tools Management</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="toolsForm">
            <div formArrayName="tools">
              <div *ngFor="let tool of toolsArray.controls; let i = index" [formGroupName]="i" class="tool-item">
                <mat-form-field appearance="outline">
                  <mat-label>Tool Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter tool name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Enter tool description"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Color</mat-label>
                  <input matInput formControlName="color" type="color" placeholder="Select color">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Link</mat-label>
                  <input matInput formControlName="link" placeholder="Enter tool link">
                </mat-form-field>

                <button mat-icon-button color="warn" (click)="removeTool(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="actions">
              <button mat-raised-button color="primary" (click)="addTool()" type="button">
                <mat-icon>add</mat-icon>
                Add Tool
              </button>
              <button mat-raised-button color="accent" (click)="saveTools()" type="button">
                <mat-icon>save</mat-icon>
                Save Changes
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tools-management {
      padding: 20px;
    }

    .tool-item {
      display: flex;
      gap: 16px;
      align-items: start;
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    mat-form-field {
      flex: 1;
    }

    .actions {
      margin-top: 20px;
      display: flex;
      gap: 16px;
    }

    textarea {
      min-height: 100px;
    }
  `]
})
export class ToolsManagementComponent implements OnInit {
  toolsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fleetService: FleetDataService,
    private snackBar: MatSnackBar
  ) {
    this.toolsForm = this.fb.group({
      tools: this.fb.array([])
    });
  }

  ngOnInit() {
    const currentTools = this.fleetService.getFleetData()().tools;
    currentTools.forEach(tool => {
      this.addTool(tool);
    });
  }

  get toolsArray() {
    return this.toolsForm.get('tools') as FormArray;
  }

  addTool(tool?: any) {
    const toolGroup = this.fb.group({
      name: [tool?.name || '', Validators.required],
      description: [tool?.description || '', Validators.required],
      color: [tool?.color || '#bae1ff', Validators.required],
      link: [tool?.link || '', Validators.required]
    });

    this.toolsArray.push(toolGroup);
  }

  removeTool(index: number) {
    this.toolsArray.removeAt(index);
  }

  saveTools() {
    if (this.toolsForm.valid) {
      const currentData = this.fleetService.getFleetData()();
      const updatedData = {
        ...currentData,
        tools: this.toolsForm.value.tools
      };
      
      // In a real application, you would make an API call here
      // For now, we'll just update the service
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