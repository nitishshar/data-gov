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

// Based on ag-Grid's official filter models
export interface AgGridTextFilterModel {
  type: 'text';
  filter?: string;
  filterType: 'contains' | 'notContains' | 'equals' | 'notEqual' | 'startsWith' | 'endsWith';
  field: string;
}

export interface AgGridNumberFilterModel {
  type: 'number';
  filter?: number;
  filterTo?: number;
  filterType: 'equals' | 'notEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'inRange';
  field: string;
}

export interface AgGridDateFilterModel {
  type: 'date';
  dateFrom?: string | Date;
  dateTo?: string | Date;
  filterType: 'equals' | 'notEqual' | 'greaterThan' | 'lessThan' | 'inRange';
  field: string;
}

export interface AgGridSetFilterModel {
  type: 'set';
  values: string[];
  field: string;
}

export type AgGridFilterModel = AgGridTextFilterModel | AgGridNumberFilterModel | AgGridDateFilterModel | AgGridSetFilterModel;

export interface AgGridCompositeFilterModel {
  filterType: 'multi';
  operator?: 'AND' | 'OR';
  conditions: AgGridFilterModel[];
}

export interface FilterConfig {
  operands: FilterOperand[];
  operators: FilterOperator[];
  logicalOperators: LogicalOperator[];
  showGeneratedSql?: boolean;
  outputFormat?: FilterOutputFormat;
}

export type TokenType = 'operand' | 'operator' | 'value' | 'logical' | 'bracket';

export interface BaseFilterToken {
  displayValue?: string;
  operandType?: string;
  groupId?: string;
}

export interface OperandToken extends BaseFilterToken {
  type: 'operand';
  value: string;
}

export interface OperatorToken extends BaseFilterToken {
  type: 'operator';
  value: string;
}

export interface ValueToken extends BaseFilterToken {
  type: 'value';
  value: string;
  isCollapsed?: boolean;
  fullValues?: FilterToken[];
}

export interface LogicalToken extends BaseFilterToken {
  type: 'logical';
  value: string;
}

export interface BracketToken extends BaseFilterToken {
  type: 'bracket';
  value: '(' | ')';
}

export type FilterToken = OperandToken | OperatorToken | ValueToken | LogicalToken | BracketToken;

export interface FilterSuggestion {
  label: string;
  value: string;
  displayValue: string;
  type: 'operand' | 'operator' | 'value' | 'logical' | 'bracket';
  operandType?: string;
} 