import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  FilterConfig, 
  FilterToken, 
  FilterSuggestion, 
  FilterOperand, 
  FilterOperator,
  FilterOutputFormat,
  AgGridFilterModel,
  AgGridCompositeFilterModel,
  AgGridNumberFilterModel,
  AgGridDateFilterModel
} from '../../models/sql-filter.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-sql-filter-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sql-filter-builder.component.html',
  styleUrls: ['./sql-filter-builder.component.scss']
})
export class SqlFilterBuilderComponent implements OnInit, OnDestroy {
  @Input() config!: FilterConfig;
  @Output() filterChange = new EventEmitter<string | AgGridCompositeFilterModel>();
  @ViewChild('filterInput') filterInput!: ElementRef;

  inputValue = '';
  tokens: FilterToken[] = [];
  suggestions: FilterSuggestion[] = [];
  currentOperand: FilterOperand | null = null;
  currentOperator: FilterOperator | null = null;
  showSuggestions = false;
  selectedSuggestionIndex = -1;
  isLoading = false;
  isMultiSelectMode = false;
  selectedValues: FilterSuggestion[] = [];
  isAutocompleteMode = false;
  bracketCount = 0;
  dropdownPosition = { top: 0, left: 0 };
  generatedSql = '';
  validationError: string | null = null;
  outputFormat: 'sql' | 'ag-grid' = 'sql';

  private inputSubject = new Subject<string>();
  private subscription: Subscription | null = null;

  get showGeneratedSql(): boolean {
    return this.config.showGeneratedSql ?? true; // Default to true if not specified
  }

  get shouldShowValueSelect(): boolean {
    return !!(
      this.currentOperand &&
      this.currentOperator &&
      (this.currentOperand.options || this.currentOperand.optionsLoader) &&
      this.currentOperand.type === 'select'
    );
  }

  get shouldShowAutocomplete(): boolean {
    return !!(
      this.currentOperand &&
      this.currentOperator &&
      (this.currentOperand.options || this.currentOperand.optionsLoader) &&
      this.currentOperand.type === 'autocomplete'
    );
  }

  get isMultiSelectAutocomplete(): boolean {
    return this.shouldShowAutocomplete && this.currentOperator?.symbol === 'IN';
  }

  getPlaceholder(): string {
    if (!this.currentOperand) {
      return 'Type to search for a column or "(" to start a group...';
    } else if (!this.currentOperator) {
      return `Type an operator (=, !=, etc.) or select for "${this.currentOperand.label}"...`;
    } else if (this.isMultiSelectMode || this.isMultiSelectAutocomplete) {
      return `Search and select multiple values for "${this.currentOperand.label}"...`;
    } else if (this.shouldShowAutocomplete) {
      return `Search for a value in "${this.currentOperand.label}"...`;
    } else if (this.shouldShowValueSelect) {
      return `Select a value for "${this.currentOperand.label}"...`;
    } else {
      return `Enter a value for "${this.currentOperand.label}"...`;
    }
  }

  ngOnInit() {
    this.setupInputSubscription();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private setupInputSubscription() {
    this.subscription = this.inputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.updateSuggestionsForInput(value);
    });
  }

  onInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.updateDropdownPosition();
    
    // Handle direct operator input
    if (this.currentOperand && !this.currentOperator) {
      // Check for compound operators (>=, <=, <>, etc.)
      const isCompoundOperatorStart = ['>', '<', '=', '!'].includes(input);
      const operator = this.config.operators.find(op => 
        (op.symbol === input || op.label.toLowerCase() === input.toLowerCase()) && 
        op.applicableTypes.includes(this.currentOperand!.type)
      );

      // Don't immediately select for potential compound operators
      if (operator && !isCompoundOperatorStart) {
        // Clear input before selecting operator
        this.inputValue = '';
        (event.target as HTMLInputElement).value = '';
        
        this.selectSuggestion({
          type: 'operator',
          value: operator.symbol,
          label: operator.label,
          displayValue: operator.label
        });
        return;
      }

      // Handle compound operators
      if (isCompoundOperatorStart) {
        this.inputValue = input;
        this.showSuggestions = true;
        this.updateSuggestionsForInput(input);
        return;
      }
    }

    // Handle parentheses
    if (input === '(') {
      this.addOpeningBracket();
      this.inputValue = '';
      (event.target as HTMLInputElement).value = '';
      return;
    } else if (input === ')' && this.canAddClosingBracket()) {
      this.addClosingBracket();
      this.inputValue = '';
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.inputValue = input;
    this.showSuggestions = true;
    this.selectedSuggestionIndex = -1;
    this.inputSubject.next(input);
  }

  private addOpeningBracket() {
    this.tokens.push({
      type: 'bracket',
      value: '(',
      displayValue: '('
    });
    this.bracketCount++;
    this.inputValue = '';
    this.emitChange();
  }

  private addClosingBracket() {
    this.tokens.push({
      type: 'bracket',
      value: ')',
      displayValue: ')'
    });
    this.bracketCount--;
    this.inputValue = '';
    this.emitChange();
  }

  private canAddClosingBracket(): boolean {
    return this.bracketCount > 0;
  }

  onFocus() {
    this.updateDropdownPosition();
    if (this.shouldShowValueSelect || this.isMultiSelectMode) {
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
    } else if (this.shouldShowAutocomplete) {
      this.showSuggestions = true;
      this.isAutocompleteMode = true;
      if (this.inputValue) {
        this.updateSuggestionsForInput(this.inputValue);
      }
    } else {
      this.showSuggestions = true;
      this.updateSuggestionsForInput(this.inputValue);
    }
  }

  onBlur(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.suggestions-dropdown')) {
      setTimeout(() => {
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
        if (!this.isMultiSelectAutocomplete) {
          this.isAutocompleteMode = false;
        }
      }, 200);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle parentheses with keyboard
    if (event.key === '(') {
      event.preventDefault();
      this.addOpeningBracket();
      return;
    } else if (event.key === ')' && this.canAddClosingBracket()) {
      event.preventDefault();
      this.addClosingBracket();
      return;
    }

    if (this.isMultiSelectMode || this.isMultiSelectAutocomplete) {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        this.confirmMultiSelect();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelMultiSelect();
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.selectedSuggestionIndex >= 0 && this.selectedSuggestionIndex < this.suggestions.length) {
        this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
      } else if (this.suggestions.length > 0) {
        this.selectSuggestion(this.suggestions[0]);
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
      this.isAutocompleteMode = false;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestionIndex = Math.min(
        this.selectedSuggestionIndex + 1,
        this.suggestions.length - 1
      );
      if (this.selectedSuggestionIndex === -1 && this.suggestions.length > 0) {
        this.selectedSuggestionIndex = 0;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
    } else if (event.key === 'Backspace' && !this.inputValue) {
      event.preventDefault();
      this.removeLastToken();
    }
  }

  selectSuggestion(suggestion: FilterSuggestion) {
    if (suggestion.type === 'operator' && suggestion.value === 'IN') {
      this.currentOperator = this.config.operators.find(op => op.symbol === suggestion.value) || null;
      this.isMultiSelectMode = true;
      this.isAutocompleteMode = this.currentOperand?.type === 'autocomplete';
      this.selectedValues = [];
      this.tokens.push({
        type: suggestion.type,
        value: suggestion.value,
        displayValue: suggestion.displayValue,
        operandType: suggestion.operandType
      });
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
      return;
    }

    const token: FilterToken = {
      type: suggestion.type,
      value: suggestion.value,
      displayValue: suggestion.displayValue,
      operandType: suggestion.operandType
    };

    this.tokens.push(token);
    this.inputValue = '';
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
    
    if (suggestion.type === 'operand') {
      this.currentOperand = this.config.operands.find(op => op.name === suggestion.value) || null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
    } else if (suggestion.type === 'operator') {
      this.currentOperator = this.config.operators.find(op => op.symbol === suggestion.value) || null;
      if (this.shouldShowValueSelect) {
        this.showSuggestions = true;
        this.updateSuggestionsForInput('');
      } else if (this.shouldShowAutocomplete) {
        this.isAutocompleteMode = true;
        this.showSuggestions = true;
      }
    } else if (suggestion.type === 'value') {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
    } else if (suggestion.type === 'logical') {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
    }

    if (!this.shouldShowValueSelect && !this.shouldShowAutocomplete) {
      this.updateSuggestionsForInput('');
    }
    this.emitChange();
  }

  isValueSelected(value: string): boolean {
    return this.selectedValues.some(v => v.value === value);
  }

  toggleValue(suggestion: FilterSuggestion) {
    const index = this.selectedValues.findIndex(v => v.value === suggestion.value);
    if (index === -1) {
      this.selectedValues.push(suggestion);
    } else {
      this.selectedValues.splice(index, 1);
    }
  }

  confirmMultiSelect() {
    if (this.selectedValues.length === 0) return;

    // Add opening parenthesis
    this.tokens.push({
      type: 'bracket',
      value: '(',
      displayValue: '('
    });

    // Add selected values
    this.selectedValues.forEach((value, index) => {
      if (index > 0) {
        // Add comma between values
        this.tokens.push({
          type: 'operator',
          value: ',',
          displayValue: ','
        });
      }

      this.tokens.push({
        type: 'value',
        value: value.value,
        displayValue: value.label
      });
    });

    // Add closing parenthesis
    this.tokens.push({
      type: 'bracket',
      value: ')',
      displayValue: ')'
    });

    // Reset all states
    this.isMultiSelectMode = false;
    this.isAutocompleteMode = false;
    this.selectedValues = [];
    this.currentOperand = null;
    this.currentOperator = null;
    this.showSuggestions = false;
    this.inputValue = '';
    this.emitChange();
    
    // Update suggestions to show logical operators
    this.updateSuggestionsForInput('');
  }

  cancelMultiSelect() {
    this.isMultiSelectMode = false;
    this.isAutocompleteMode = false;
    this.selectedValues = [];
    // Remove the IN operator token
    this.tokens.pop();
    this.currentOperator = null;
    this.showSuggestions = false;
    this.inputValue = '';
    this.emitChange();
  }

  removeLastToken() {
    if (this.tokens.length > 0) {
      const lastToken = this.tokens[this.tokens.length - 1];
      
      // Handle bracket counting
      if (lastToken.type === 'bracket') {
        if (lastToken.value === '(') {
          this.bracketCount--;
        } else {
          this.bracketCount++;
        }
      }

      // If we're removing an IN operator or its related tokens
      if (lastToken.type === 'operator' && lastToken.value === 'IN') {
        this.tokens.pop(); // Remove IN operator
        this.isMultiSelectMode = false;
        this.isAutocompleteMode = false;
        this.selectedValues = [];
      } else if (lastToken.type === 'bracket' && lastToken.value === ')' && this.tokens.length > 1) {
        // Check if this is part of an IN clause
        const prevTokens = this.tokens.slice(0, -1);
        const inOperatorIndex = prevTokens.findIndex(t => t.type === 'operator' && t.value === 'IN');
        if (inOperatorIndex !== -1) {
          // Remove everything from IN operator onwards
          this.tokens = this.tokens.slice(0, inOperatorIndex);
          this.isMultiSelectMode = false;
          this.isAutocompleteMode = false;
          this.selectedValues = [];
        } else {
          this.tokens.pop();
        }
      } else {
        this.tokens.pop();
      }

      this.resetCurrentState();
      this.emitChange();
      this.updateSuggestionsForInput(this.inputValue);
    }
  }

  private resetCurrentState() {
    let operand = null;
    let operator = null;
    let foundOperand = false;
    let lastToken = this.tokens[this.tokens.length - 1];
    
    // If the last token is a value or closing bracket, we should allow logical operators
    if (lastToken && (lastToken.type === 'value' || (lastToken.type === 'bracket' && lastToken.value === ')'))) {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isMultiSelectMode = false;
      this.isAutocompleteMode = false;
      this.selectedValues = [];
      this.showSuggestions = false;
      return;
    }

    // Find the last operand and its operator
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (!foundOperand && token.type === 'operand') {
        operand = this.config.operands.find(op => op.name === token.value) || null;
        foundOperand = true;
      } else if (foundOperand && !operator && token.type === 'operator') {
        operator = this.config.operators.find(op => op.symbol === token.value) || null;
        break;
      }
    }

    // If we have no tokens or the last token is a logical operator, reset everything
    if (this.tokens.length === 0 || (lastToken && lastToken.type === 'logical')) {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isMultiSelectMode = false;
      this.isAutocompleteMode = false;
      this.selectedValues = [];
      this.showSuggestions = false;
      return;
    }

    this.currentOperand = operand;
    this.currentOperator = operator;
    this.isMultiSelectMode = operator?.symbol === 'IN' || false;
    this.isAutocompleteMode = this.isMultiSelectMode && operand?.type === 'autocomplete' || false;
    this.selectedValues = [];
    this.showSuggestions = this.isMultiSelectMode || this.isAutocompleteMode;
  }

  private updateSuggestionsForInput(input: string) {
    this.suggestions = [];
    const lowercaseInput = input.toLowerCase();
    const lastToken = this.tokens[this.tokens.length - 1];

    // Reset suggestions if we're in a clean state or after a logical operator
    if (this.tokens.length === 0 || (lastToken && lastToken.type === 'logical')) {
      this.suggestions = this.config.operands
        .filter(op => op.label.toLowerCase().includes(lowercaseInput))
        .map(op => ({
          type: 'operand' as const,
          value: op.name,
          label: op.label,
          displayValue: op.label,
          operandType: op.type
        }));
      return;
    }

    // Special handling for compound operators
    if (this.currentOperand && !this.currentOperator && ['>', '<', '=', '!'].includes(input)) {
      this.suggestions = this.config.operators
        .filter(op => 
          op.symbol.startsWith(input) && 
          op.applicableTypes.includes(this.currentOperand!.type)
        )
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));
      return;
    }

    if (this.isMultiSelectMode || (this.currentOperator?.symbol === 'IN' && this.currentOperand)) {
      // Show value suggestions for IN operator
      if (this.currentOperand && (
        this.currentOperand.type === 'select' || 
        this.currentOperand.type === 'multiselect' || 
        this.currentOperand.type === 'autocomplete'
      )) {
        if (this.currentOperand.options) {
          this.suggestions = this.currentOperand.options
            .filter(opt => opt.label.toLowerCase().includes(lowercaseInput))
            .map(opt => ({
              type: 'value' as const,
              value: opt.value,
              label: opt.label,
              displayValue: opt.label
            }));
        } else if (this.currentOperand.optionsLoader) {
          this.isLoading = true;
          this.currentOperand.optionsLoader(lowercaseInput).subscribe(
            options => {
              this.suggestions = options.map(opt => ({
                type: 'value' as const,
                value: opt.value,
                label: opt.label,
                displayValue: opt.label
              }));
              this.isLoading = false;
            },
            error => {
              console.error('Error loading options:', error);
              this.isLoading = false;
            }
          );
        }
        return;
      }
    }

    if (!this.currentOperand && !this.currentOperator) {
      // Show operands and logical operators if appropriate
      const suggestions: FilterSuggestion[] = [...this.config.operands
        .filter(op => op.label.toLowerCase().includes(lowercaseInput))
        .map(op => ({
          type: 'operand' as const,
          value: op.name,
          label: op.label,
          displayValue: op.label,
          operandType: op.type
        }))];

      // Add logical operators if we have tokens and last token is a value or closing bracket
      if (lastToken && (lastToken.type === 'value' || (lastToken.type === 'bracket' && lastToken.value === ')'))) {
        suggestions.push(
          ...this.config.logicalOperators
            .filter(op => op.label.toLowerCase().includes(lowercaseInput))
            .map(op => ({
              type: 'logical' as const,
              value: op.value,
              label: op.label,
              displayValue: op.label
            }))
        );
      }

      this.suggestions = suggestions;
    } else if (this.currentOperand && !this.currentOperator) {
      // Show applicable operators
      this.suggestions = this.config.operators
        .filter(op => 
          op.applicableTypes.includes(this.currentOperand!.type) &&
          op.label.toLowerCase().includes(lowercaseInput)
        )
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));
    } else if (this.currentOperand && this.currentOperator && !this.isMultiSelectMode) {
      // Show value suggestions based on operand type
      if (this.currentOperand.type === 'select' || this.currentOperand.type === 'multiselect' || this.currentOperand.type === 'autocomplete') {
        if (this.currentOperand.options) {
          this.suggestions = this.currentOperand.options
            .filter(opt => opt.label.toLowerCase().includes(lowercaseInput))
            .map(opt => ({
              type: 'value' as const,
              value: opt.value,
              label: opt.label,
              displayValue: opt.label
            }));
        } else if (this.currentOperand.optionsLoader) {
          this.isLoading = true;
          this.currentOperand.optionsLoader(lowercaseInput).subscribe(
            options => {
              this.suggestions = options.map(opt => ({
                type: 'value' as const,
                value: opt.value,
                label: opt.label,
                displayValue: opt.label
              }));
              this.isLoading = false;
            },
            error => {
              console.error('Error loading options:', error);
              this.isLoading = false;
            }
          );
        }
      } else if (lowercaseInput) {
        // For text, number, and date inputs
        this.suggestions = [{
          type: 'value' as const,
          value: input,
          label: input,
          displayValue: input
        }];
      }
    }
  }

  private validateFilter(): string | null {
    // Check for unclosed brackets
    if (this.bracketCount > 0) {
      return 'Missing closing bracket )';
    }

    // Check for incomplete expression
    if (this.tokens.length === 0) {
      return null; // Empty filter is valid
    }

    const lastToken = this.tokens[this.tokens.length - 1];
    
    // Check if expression ends with operator
    if (lastToken.type === 'operator' && lastToken.value !== ',') {
      return 'Incomplete expression: operator needs a value';
    }

    // Check if expression ends with operand
    if (lastToken.type === 'operand') {
      return 'Incomplete expression: operand needs an operator';
    }

    // Check if expression ends with logical operator
    if (lastToken.type === 'logical') {
      return 'Incomplete expression: logical operator needs a condition';
    }

    // Check for empty brackets and incomplete logical operators
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      const nextToken = i < this.tokens.length - 1 ? this.tokens[i + 1] : null;

      // Check for empty brackets
      if (token.type === 'bracket' && token.value === '(' && nextToken?.type === 'bracket' && nextToken.value === ')') {
        return 'Empty brackets are not allowed';
      }

      // Check for logical operators followed by invalid tokens
      if (token.type === 'logical') {
        if (!nextToken) {
          return `Incomplete expression: ${token.value} needs a condition`;
        }
        // Only allow operands or opening brackets after logical operators
        if (nextToken.type !== 'operand' && !(nextToken.type === 'bracket' && nextToken.value === '(')) {
          return `Invalid expression after ${token.value}: expected column name or opening bracket`;
        }
      }
    }

    // Check for missing values in IN clause
    let inOperatorIndex = -1;
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.type === 'operator' && token.value === 'IN') {
        inOperatorIndex = i;
      } else if (inOperatorIndex !== -1) {
        // Check if we have proper IN clause structure
        if (i === inOperatorIndex + 1 && token.type !== 'bracket') {
          return 'IN operator must be followed by opening bracket';
        }
        if (token.type === 'bracket' && token.value === ')') {
          // Check if we have any values between brackets
          const hasValues = this.tokens
            .slice(inOperatorIndex + 2, i)
            .some(t => t.type === 'value');
          if (!hasValues) {
            return 'IN clause must contain at least one value';
          }
          inOperatorIndex = -1;
        }
      }
    }
    if (inOperatorIndex !== -1) {
      return 'Incomplete IN clause';
    }

    return null;
  }

  private groupFilterTokens() {
    const filterGroups = [];
    let currentGroup: FilterToken[] = [];
    let bracketStack = 0;
    let inClauseActive = false;

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      // Handle brackets
      if (token.type === 'bracket') {
        if (token.value === '(') {
          bracketStack++;
          // Start of IN clause
          if (i > 0 && this.tokens[i - 1].type === 'operator' && this.tokens[i - 1].value === 'IN') {
            inClauseActive = true;
          }
        } else {
          bracketStack--;
          // End of IN clause
          if (inClauseActive && bracketStack === 0) {
            inClauseActive = false;
            currentGroup.push(token);
            if (currentGroup.length > 0) {
              filterGroups.push([...currentGroup]);
              currentGroup = [];
            }
            continue;
          }
        }
      }

      // Add token to current group
      currentGroup.push(token);

      // Check if we should close the current group
      if (bracketStack === 0 && !inClauseActive) {
        if (
          // Complete condition (operand-operator-value)
          (token.type === 'value') ||
          // Logical operator marks the end of a group
          (token.type === 'logical') ||
          // Last token
          (i === this.tokens.length - 1)
        ) {
          if (currentGroup.length > 0) {
            // Remove logical operator from current group and add it to the next group
            if (token.type === 'logical') {
              currentGroup.pop();
            }
            filterGroups.push([...currentGroup]);
            currentGroup = [];
            if (token.type === 'logical') {
              currentGroup.push(token);
            }
          }
        }
      }
    }

    // Add any remaining tokens
    if (currentGroup.length > 0) {
      filterGroups.push(currentGroup);
    }

    return filterGroups;
  }

  private convertToAgGridFilterType(operandType: string, operator: string): any {
    // Text filters
    if (operandType === 'text') {
      switch (operator) {
        case '=': return 'equals' as const;
        case '!=': return 'notEqual' as const;
        case 'LIKE': return 'contains' as const;
        case 'NOT LIKE': return 'notContains' as const;
        case 'STARTS WITH': return 'startsWith' as const;
        case 'ENDS WITH': return 'endsWith' as const;
        default: return 'equals' as const;
      }
    }
    // Number filters
    else if (operandType === 'number') {
      switch (operator) {
        case '=': return 'equals' as const;
        case '!=': return 'notEqual' as const;
        case '>': return 'greaterThan' as const;
        case '>=': return 'greaterThanOrEqual' as const;
        case '<': return 'lessThan' as const;
        case '<=': return 'lessThanOrEqual' as const;
        case 'BETWEEN': return 'inRange' as const;
        default: return 'equals' as const;
      }
    }
    // Date filters
    else if (operandType === 'date') {
      switch (operator) {
        case '=': return 'equals' as const;
        case '!=': return 'notEqual' as const;
        case '>': return 'greaterThan' as const;
        case '<': return 'lessThan' as const;
        case 'BETWEEN': return 'inRange' as const;
        default: return 'equals' as const;
      }
    }
    return 'equals' as const;
  }

  private generateAgGridFilter(filterGroups: FilterToken[][]): AgGridCompositeFilterModel {
    if (filterGroups.length === 0) return { filterType: 'multi', conditions: [] };

    const createAgGridCondition = (group: FilterToken[]): AgGridFilterModel => {
      const operand = group.find(t => t.type === 'operand');
      const operator = group.find(t => t.type === 'operator');
      const values = group.filter(t => t.type === 'value');
      
      if (!operand) throw new Error('No operand found in filter group');
      
      const operandConfig = this.config.operands.find(op => op.name === operand.value);
      if (!operandConfig) throw new Error(`No operand config found for ${operand.value}`);

      // Handle Set Filter (IN operator)
      if (operator?.value === 'IN' || operator?.value === 'NOT IN' || 
          operandConfig.type === 'select' || operandConfig.type === 'multiselect') {
        return {
          type: 'set',
          field: operand.value,
          values: values.map(v => v.value)
        };
      }

      // Handle Text Filter
      if (operandConfig.type === 'text' || operandConfig.type === 'autocomplete') {
        return {
          type: 'text',
          field: operand.value,
          filterType: this.convertToAgGridFilterType('text', operator?.value || '='),
          filter: values[0]?.value
        };
      }

      // Handle Number Filter
      if (operandConfig.type === 'number') {
        const numberFilter: AgGridNumberFilterModel = {
          type: 'number',
          field: operand.value,
          filterType: this.convertToAgGridFilterType('number', operator?.value || '='),
          filter: Number(values[0]?.value)
        };

        // Handle range filters if needed
        if (operator?.value === 'BETWEEN' && values.length === 2) {
          numberFilter.filterType = 'inRange';
          numberFilter.filterTo = Number(values[1].value);
        }

        return numberFilter;
      }

      // Handle Date Filter
      if (operandConfig.type === 'date') {
        const dateFilter: AgGridDateFilterModel = {
          type: 'date',
          field: operand.value,
          filterType: this.convertToAgGridFilterType('date', operator?.value || '='),
          dateFrom: values[0]?.value
        };

        // Handle range filters if needed
        if (operator?.value === 'BETWEEN' && values.length === 2) {
          dateFilter.filterType = 'inRange';
          dateFilter.dateTo = values[1].value;
        }

        return dateFilter;
      }

      // Default to text filter if type is not recognized
      return {
        type: 'text',
        field: operand.value,
        filterType: 'equals',
        filter: values[0]?.value
      };
    };

    // Create the composite filter model
    const result: AgGridCompositeFilterModel = {
      filterType: 'multi',
      conditions: []
    };

    let currentLogicalOperator: 'AND' | 'OR' | undefined;

    // Process all groups
    filterGroups.forEach((group, index) => {
      const logical = group.find(t => t.type === 'logical');
      const nonLogicalTokens = group.filter(t => t.type !== 'logical');

      if (logical) {
        currentLogicalOperator = logical.value as 'AND' | 'OR';
      }

      if (nonLogicalTokens.length > 0) {
        try {
          const condition = createAgGridCondition(nonLogicalTokens);
          result.conditions.push(condition);

          // Set the operator for the composite filter
          if (index > 0 && currentLogicalOperator) {
            result.operator = currentLogicalOperator;
          }
        } catch (error) {
          console.error('Error creating ag-Grid filter condition:', error);
        }
      }
    });

    return result;
  }

  private emitChange() {
    this.validationError = this.validateFilter();
    const filterGroups = this.groupFilterTokens();
    const agGridFilter = this.generateAgGridFilter(filterGroups);
    
    // Generate SQL
    let sql = '';
    if (this.tokens.length > 0) {
      this.tokens.forEach((token, index) => {
        if (token.type === 'logical') {
          sql += ` ${token.value} `;
        } else if (token.type === 'operand') {
          sql += token.value;
        } else if (token.type === 'operator') {
          sql += token.value === ',' ? token.value : ` ${token.value} `;
        } else if (token.type === 'value') {
          const operand = this.tokens
            .slice(0, index)
            .reverse()
            .find(t => t.type === 'operand');
          
          if (operand && this.config.operands.find(op => op.name === operand.value)?.type === 'text') {
            sql += `'${token.value}'`;
          } else {
            sql += token.value;
          }
        } else if (token.type === 'bracket') {
          sql += token.value;
        }
      });
    }
    this.generatedSql = sql;

    // Emit changes based on output format
    if (this.outputFormat === 'sql') {
      this.filterChange.emit(this.validationError ? '' : sql);
    } else {
      this.filterChange.emit(this.validationError ? { filterType: 'multi', conditions: [] } : agGridFilter);
    }

    // Create detailed filter object for logging
    const completeFilterObject = {
      rawTokens: this.tokens.map(token => ({
        type: token.type,
        value: token.value,
        displayValue: token.displayValue,
        operandType: token.operandType
      })),
      
      parsedGroups: filterGroups.map(group => {
        const operand = group.find(t => t.type === 'operand');
        const operator = group.find(t => t.type === 'operator');
        const values = group.filter(t => t.type === 'value');
        const logical = group.find(t => t.type === 'logical');
        const brackets = group.filter(t => t.type === 'bracket');
        
        return {
          groupTokens: group,
          parsed: {
            field: operand ? {
              name: operand.value,
              displayName: operand.displayValue,
              type: this.config.operands.find(op => op.name === operand.value)?.type
            } : null,
            operator: operator ? {
              symbol: operator.value,
              displayName: operator.displayValue
            } : null,
            values: values.map(v => ({
              value: v.value,
              displayValue: v.displayValue
            })),
            logicalOperator: logical?.value,
            hasBrackets: brackets.length > 0,
            brackets: brackets.map(b => b.value)
          }
        };
      }),

      outputs: {
        sql: {
          query: this.generatedSql,
          isValid: !this.validationError
        },
        agGrid: {
          filter: agGridFilter,
          isValid: !this.validationError
        }
      },

      state: {
        validation: {
          isValid: !this.validationError,
          error: this.validationError
        },
        current: {
          operand: this.currentOperand ? {
            name: this.currentOperand.name,
            label: this.currentOperand.label,
            type: this.currentOperand.type
          } : null,
          operator: this.currentOperator ? {
            symbol: this.currentOperator.symbol,
            label: this.currentOperator.label
          } : null,
          bracketCount: this.bracketCount,
          modes: {
            isMultiSelectMode: this.isMultiSelectMode,
            isAutocompleteMode: this.isAutocompleteMode
          },
          selectedValues: this.selectedValues
        },
        outputFormat: this.outputFormat
      }
    };

    // Log the complete filter object
    console.log('Complete Filter Object:', completeFilterObject);
  }

  updateDropdownPosition() {
    if (!this.filterInput?.nativeElement) return;

    const inputEl = this.filterInput.nativeElement;
    const rect = inputEl.getBoundingClientRect();
    const cursorPosition = inputEl.selectionStart || 0;
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = window.getComputedStyle(inputEl).font;
    span.textContent = inputEl.value.substring(0, cursorPosition);
    document.body.appendChild(span);
    
    // Calculate position
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + textWidth + window.scrollX
    };
  }
} 