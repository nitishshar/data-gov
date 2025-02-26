import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';

@Component({
  selector: 'app-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, AgGridModule],
  template: `
    <h2 mat-dialog-title>Preview Imported Data</h2>
    <mat-dialog-content>
      <ag-grid-angular
        class="ag-theme-alpine"
        [rowData]="data.rowData"
        [columnDefs]="data.columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="10"
        [modules]="modules"
        style="height: 500px; width: 100%;"
      >
      </ag-grid-angular>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Import</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-dialog-content {
      max-height: none !important;
      padding: 20px;
    }

    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
  `]
})
export class PreviewDialogComponent {
  modules = [ClientSideRowModelModule];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(
    public dialogRef: MatDialogRef<PreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rowData: any[], columnDefs: ColDef[] }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
} 