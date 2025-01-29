import { Observable } from 'rxjs';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOperand {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'autocomplete';
  options?: FilterOption[];
  optionsLoader?: (search: string) => Observable<FilterOption[]>;
}

export interface FilterOperator {
  symbol: string;
  label: string;
  applicableTypes: Array<'text' | 'number' | 'date' | 'select' | 'multiselect' | 'autocomplete'>;
  percentageSupport?: boolean;
}

export interface LogicalOperator {
  value: string;
  label: string;
}

export type FilterOutputFormat = 'sql' | 'ag-grid';

export interface AgGridFilterModel {
  filterType: 'text' | 'number' | 'date' | 'set';
  type: string;
  filter?: any;
  values?: any[];
  filterTo?: any;
  operator?: 'AND' | 'OR';
}

export interface AgGridCompositeFilterModel {
  filterType?: 'multi';
  operator?: 'AND' | 'OR';
  conditions?: AgGridFilterModel[];
}

export interface FilterConfig {
  operands: FilterOperand[];
  operators: FilterOperator[];
  logicalOperators: LogicalOperator[];
  showGeneratedSql?: boolean;
  outputFormat?: FilterOutputFormat;
}

export interface FilterToken {
  type: 'operand' | 'operator' | 'value' | 'logical' | 'bracket';
  value: string;
  displayValue?: string;
  operandType?: string;
}

export interface FilterSuggestion {
  label: string;
  value: string;
  displayValue: string;
  type: 'operand' | 'operator' | 'value' | 'logical' | 'bracket';
  operandType?: string;
} 