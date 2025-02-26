import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="excel-import-container">
      <input
        type="file"
        #fileInput
        (change)="onFileChange($event)"
        accept=".xlsx, .xls"
        style="display: none"
      />
      
      <button mat-icon-button class="import-button" (click)="fileInput.click()">
        <mat-icon>upload_file</mat-icon>
      </button>

      <ag-grid-angular
        *ngIf="rowData.length"
        class="ag-theme-alpine"
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="10"
        [modules]="modules"
      >
      </ag-grid-angular>
    </div>
  `,
  styles: [`
    .excel-import-container {
      height: 100%;
      width: 100%;
      position: relative;
    }

    .import-button {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1;
    }

    ag-grid-angular {
      height: calc(100% - 20px);
      width: 100%;
      margin-top: 20px;
    }
  `]
})
export class ExcelImportComponent {
  @ViewChild('fileInput') fileInput: any;

  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  
  modules = [ClientSideRowModelModule];
  
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(private dialog: MatDialog) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as Record<string, any>[];

        // Create column definitions from the first row
        if (data.length > 0) {
          this.columnDefs = this.generateColumnDefs(data);
        }

        // Open preview dialog
        this.dialog.open(PreviewDialogComponent, {
          data: { rowData: data, columnDefs: this.columnDefs },
          width: '80%',
          height: '80%',
          position: { top: '50px' }
        }).afterClosed().subscribe(result => {
          if (result) {
            this.rowData = data;
          }
          this.fileInput.nativeElement.value = '';
        });
      };
      reader.readAsBinaryString(file);
    }
  }

  private generateColumnDefs(data: Record<string, any>[]): ColDef[] {
    return Object.keys(data[0]).map(key => {
      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
      const colDef: ColDef = {
        field: key,
        headerName: this.formatHeaderName(key),
        flex: 1
      };
      
      // Determine column type from values
      if (values.length > 0) {
        if (values.every(val => !isNaN(Number(val)))) {
          colDef.type = 'numericColumn';
          colDef.filter = 'agNumberColumnFilter';
          colDef.valueFormatter = (params: ValueFormatterParams) => {
            const num = Number(params.value);
            return isNaN(num) ? params.value : num.toLocaleString();
          };
        } else if (values.every(val => !isNaN(Date.parse(val)))) {
          colDef.type = 'dateColumn';
          colDef.filter = 'agDateColumnFilter';
          colDef.valueFormatter = (params: ValueFormatterParams) => {
            return params.value ? new Date(params.value).toLocaleDateString() : '';
          };
        }
      }
      
      return colDef;
    });
  }

  private formatHeaderName(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 