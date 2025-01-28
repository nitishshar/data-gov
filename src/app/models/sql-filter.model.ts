import { Observable } from 'rxjs';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOperand {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: FilterOption[];
  optionsLoader?: (search: string) => Observable<FilterOption[]>;
}

export interface FilterOperator {
  symbol: string;
  label: string;
  applicableTypes: Array<'text' | 'number' | 'date' | 'select' | 'multiselect'>;
  percentageSupport?: boolean;
}

export interface LogicalOperator {
  value: string;
  label: string;
}

export interface FilterConfig {
  operands: FilterOperand[];
  operators: FilterOperator[];
  logicalOperators: LogicalOperator[];
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