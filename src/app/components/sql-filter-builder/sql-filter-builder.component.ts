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
  AgGridDateFilterModel,
  BracketToken,
  OperatorToken,
  ValueToken,
  LogicalToken,
  OperandToken
} from '../../models/sql-filter.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * SQL Filter Builder Component
 * 
 * A component that provides a user-friendly interface for building SQL-like filter expressions
 * and ag-Grid filter objects. It supports various filter types including text, number, date,
 * select, multiselect, and autocomplete fields.
 * 
 * Example Usage:
 * ```html
 * <app-sql-filter-builder
 *   [config]="filterConfig"
 *   (filterChange)="onFilterChange($event)"
 * ></app-sql-filter-builder>
 * ```
 */
@Component({
  selector: 'app-sql-filter-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sql-filter-builder.component.html',
  styleUrls: ['./sql-filter-builder.component.scss']
})
export class SqlFilterBuilderComponent implements OnInit, OnDestroy {
  /** Configuration object for the filter builder */
  @Input() config!: FilterConfig;

  /** Event emitter that emits either SQL string or ag-Grid filter object based on outputFormat */
  @Output() filterChange = new EventEmitter<string | AgGridCompositeFilterModel>();

  /** Reference to the input element for handling cursor position and suggestions */
  @ViewChild('filterInput') filterInput!: ElementRef;

  /** Current value in the input field */
  inputValue = '';

  /** Array of tokens representing the current filter expression */
  tokens: FilterToken[] = [];

  /** Array of suggestions shown in the dropdown */
  suggestions: FilterSuggestion[] = [];

  /** Currently selected operand (column/field) */
  currentOperand: FilterOperand | null = null;

  /** Currently selected operator */
  currentOperator: FilterOperator | null = null;

  /** Whether to show the suggestions dropdown */
  showSuggestions = false;

  /** Index of the currently selected suggestion in the dropdown */
  selectedSuggestionIndex = -1;

  /** Whether suggestions are being loaded (for async options) */
  isLoading = false;

  /** Whether in multi-select mode (for IN operator) */
  isMultiSelectMode = false;

  /** Selected values in multi-select mode */
  selectedValues: FilterSuggestion[] = [];

  /** Whether in autocomplete mode */
  isAutocompleteMode = false;

  /** Count of open brackets for validation */
  bracketCount = 0;

  /** Position of the suggestions dropdown */
  dropdownPosition = { top: 0, left: 0 };

  /** Generated SQL string */
  generatedSql = '';

  /** Current validation error message */
  validationError: string | null = null;

  /** Output format - either 'sql' or 'ag-grid' */
  outputFormat: 'sql' | 'ag-grid' = 'sql';

  /** Subject for handling debounced input */
  private inputSubject = new Subject<string>();

  /** Subscription for input subject */
  private subscription: Subscription | null = null;

  /**
   * Whether to show the generated SQL preview
   * @returns boolean based on config setting
   * @example
   * <div *ngIf="showGeneratedSql">SQL: {{ generatedSql }}</div>
   */
  get showGeneratedSql(): boolean {
    return this.config.showGeneratedSql ?? true;
  }

  /**
   * Whether to show value select dropdown
   * @returns boolean indicating if value select should be shown
   * @example Used for select-type fields
   */
  get shouldShowValueSelect(): boolean {
    return !!(
      this.currentOperand &&
      this.currentOperator &&
      (this.currentOperand.options || this.currentOperand.optionsLoader) &&
      this.currentOperand.type === 'select'
    );
  }

  /**
   * Whether to show autocomplete dropdown
   * @returns boolean indicating if autocomplete should be shown
   * @example Used for autocomplete-type fields
   */
  get shouldShowAutocomplete(): boolean {
    return !!(
      this.currentOperand &&
      this.currentOperator &&
      (this.currentOperand.options || this.currentOperand.optionsLoader) &&
      this.currentOperand.type === 'autocomplete'
    );
  }

  /**
   * Whether in multi-select autocomplete mode
   * @returns boolean indicating if in multi-select autocomplete mode
   * @example Used for IN operator with autocomplete fields
   */
  get isMultiSelectAutocomplete(): boolean {
    return this.shouldShowAutocomplete && this.currentOperator?.symbol === 'IN';
  }

  /**
   * Gets the appropriate placeholder text for the input field
   * @returns string placeholder text
   * @example Shows different placeholders based on current state
   */
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

  /**
   * Initializes the component
   * Sets up input subscription for handling debounced input
   */
  ngOnInit() {
    this.setupInputSubscription();
  }

  /**
   * Cleans up subscriptions on component destruction
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Sets up debounced input subscription
   * @example Handles delayed suggestion updates on input
   */
  private setupInputSubscription() {
    this.subscription = this.inputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.updateSuggestionsForInput(value);
    });
  }

  /**
   * Handles input changes
   * @param event Input event
   * @example Handles direct operator input and special characters
   */
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

  /**
   * Adds an opening bracket to the filter
   * @example Used when user types "("
   */
  private addOpeningBracket() {
    const token: BracketToken = {
      type: 'bracket',
      value: '(',
      displayValue: '('
    };
    this.tokens.push(token);
    this.bracketCount++;
    this.inputValue = '';
    this.emitChange();
  }

  /**
   * Adds a closing bracket to the filter
   * @example Used when user types ")"
   */
  private addClosingBracket() {
    const token: BracketToken = {
      type: 'bracket',
      value: ')',
      displayValue: ')'
    };
    this.tokens.push(token);
    this.bracketCount--;
    this.inputValue = '';
    this.emitChange();
  }

  /**
   * Checks if a closing bracket can be added
   * @returns boolean indicating if closing bracket can be added
   * @example Used to validate bracket pairs
   */
  private canAddClosingBracket(): boolean {
    return this.bracketCount > 0;
  }

  /**
   * Handles input focus
   * @example Shows suggestions dropdown on focus
   */
  onFocus() {
    this.updateDropdownPosition();
    this.showSuggestions = true;
    
    if (this.shouldShowValueSelect || this.isMultiSelectMode) {
      this.updateSuggestionsForInput('');
    } else if (this.shouldShowAutocomplete) {
      this.isAutocompleteMode = true;
      if (this.inputValue) {
        this.updateSuggestionsForInput(this.inputValue);
      }
    } else {
      // Show initial suggestions when no input
      this.updateSuggestionsForInput('');
    }
  }

  /**
   * Handles input blur
   * @param event Focus event
   * @example Hides suggestions dropdown on blur
   */
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

  /**
   * Handles keyboard events
   * @param event Keyboard event
   * @example Handles navigation and selection in suggestions
   */
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

  /**
   * Selects a suggestion from the dropdown
   * @param suggestion The selected suggestion
   * @example Handles selection of operands, operators, and values
   */
  selectSuggestion(suggestion: FilterSuggestion) {
    // Handle both IN and NOT IN operators consistently
    if (suggestion.type === 'operator' && (suggestion.value === 'IN' || suggestion.value === 'NOT IN')) {
      this.currentOperator = this.config.operators.find(op => op.symbol === suggestion.value) || null;
      this.isMultiSelectMode = true;
      this.isAutocompleteMode = this.currentOperand?.type === 'autocomplete';
      this.selectedValues = [];
      const token: OperatorToken = {
        type: 'operator',
        value: suggestion.value,
        displayValue: suggestion.displayValue,
        operandType: suggestion.operandType
      };
      this.tokens.push(token);
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
      return;
    }

    let token: FilterToken;
    switch (suggestion.type) {
      case 'operand':
        token = {
          type: 'operand',
          value: suggestion.value,
          displayValue: suggestion.displayValue,
          operandType: suggestion.operandType
        };
        break;
      case 'operator':
        token = {
          type: 'operator',
          value: suggestion.value,
          displayValue: suggestion.displayValue,
          operandType: suggestion.operandType
        };
        break;
      case 'value':
        token = {
          type: 'value',
          value: suggestion.value,
          displayValue: suggestion.displayValue,
          operandType: suggestion.operandType
        };
        break;
      case 'logical':
        token = {
          type: 'logical',
          value: suggestion.value,
          displayValue: suggestion.displayValue,
          operandType: suggestion.operandType
        };
        break;
      case 'bracket':
        token = {
          type: 'bracket',
          value: suggestion.value as '(' | ')',
          displayValue: suggestion.displayValue,
          operandType: suggestion.operandType
        };
        break;
    }

    this.tokens.push(token);
    this.inputValue = '';
    this.selectedSuggestionIndex = -1;
    
    if (suggestion.type === 'operand') {
      this.currentOperand = this.config.operands.find(op => op.name === suggestion.value) || null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
      this.showSuggestions = true;
      const applicableOperators = this.config.operators
        .filter(op => op.applicableTypes.includes(this.currentOperand!.type))
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));
      this.suggestions = applicableOperators;
    } else if (suggestion.type === 'operator') {
      this.currentOperator = this.config.operators.find(op => op.symbol === suggestion.value) || null;
      if (this.shouldShowValueSelect) {
        this.showSuggestions = true;
        this.updateSuggestionsForInput('');
      } else if (this.shouldShowAutocomplete) {
        this.isAutocompleteMode = true;
        this.showSuggestions = true;
      } else {
        this.showSuggestions = false;
      }
    } else if (suggestion.type === 'value') {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
      this.showSuggestions = true;
      this.suggestions = this.config.logicalOperators.map(op => ({
        type: 'logical' as const,
        value: op.value,
        label: op.label,
        displayValue: op.label
      }));
    } else if (suggestion.type === 'logical') {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
    }

    if (!this.shouldShowValueSelect && !this.shouldShowAutocomplete) {
      this.emitChange();
    }
  }

  /**
   * Checks if a value is selected in multi-select mode
   * @param value Value to check
   * @returns boolean indicating if value is selected
   * @example Used in multi-select checkboxes
   */
  isValueSelected(value: string): boolean {
    return this.selectedValues.some(v => v.value === value);
  }

  /**
   * Toggles a value in multi-select mode
   * @param suggestion Suggestion to toggle
   * @example Used when clicking checkboxes in multi-select
   */
  toggleValue(suggestion: FilterSuggestion) {
    const index = this.selectedValues.findIndex(v => v.value === suggestion.value);
    if (index === -1) {
      this.selectedValues.push(suggestion);
    } else {
      this.selectedValues.splice(index, 1);
    }
  }

  /**
   * Confirms multi-select values
   * @example Used when clicking "Add" in multi-select mode
   */
  confirmMultiSelect() {
    if (this.selectedValues.length === 0) return;

    // Add opening parenthesis
    const openBracket: BracketToken = {
      type: 'bracket',
      value: '(',
      displayValue: '('
    };
    this.tokens.push(openBracket);

    // Add selected values
    this.selectedValues.forEach((value, index) => {
      if (index > 0) {
        // Add comma between values
        const comma: OperatorToken = {
          type: 'operator',
          value: ',',
          displayValue: ','
        };
        this.tokens.push(comma);
      }

      const valueToken: ValueToken = {
        type: 'value',
        value: value.value,
        displayValue: value.label
      };
      this.tokens.push(valueToken);
    });

    // Add closing parenthesis
    const closeBracket: BracketToken = {
      type: 'bracket',
      value: ')',
      displayValue: ')'
    };
    this.tokens.push(closeBracket);

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

  /**
   * Cancels multi-select mode
   * @example Used when clicking "Cancel" in multi-select mode
   */
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

  /**
   * Removes the last token from the filter
   * @example Used when pressing backspace
   */
  removeLastToken() {
    if (this.tokens.length === 0) return;

    const lastToken = this.tokens[this.tokens.length - 1];
    
    // Handle bracket count
    if (this.isBracketToken(lastToken)) {
      if (lastToken.value === '(') this.bracketCount--;
      if (lastToken.value === ')') this.bracketCount++;
    }

    // Special handling for IN and NOT IN operator values
    if (this.isValueToken(lastToken) || this.isCloseBracket(lastToken) || (this.isOperatorToken(lastToken) && lastToken.value === ',')) {
      // Look back through tokens to find if we're in an IN clause
      let inOperatorIndex = -1;
      for (let i = this.tokens.length - 1; i >= 0; i--) {
        const token = this.tokens[i];
        if (this.isOperatorToken(token) && (token.value === 'IN' || token.value === 'NOT IN')) {
          inOperatorIndex = i;
          break;
        }
      }

      if (inOperatorIndex !== -1) {
        // Remove everything after the IN operator
        this.tokens = this.tokens.slice(0, inOperatorIndex + 1);
        
        // Keep the IN operator and maintain multiselect mode
        const inOperator = this.tokens[inOperatorIndex];
        this.currentOperator = this.config.operators.find(op => op.symbol === inOperator.value) || null;
        
        // Get the operand for showing value suggestions
        const operandToken = this.tokens[inOperatorIndex - 1];
        if (this.isOperandToken(operandToken)) {
          this.currentOperand = this.config.operands.find(op => op.name === operandToken.value) || null;
          if (this.currentOperand && this.currentOperand.options) {
            this.suggestions = this.currentOperand.options.map(opt => ({
              type: 'value',
              value: opt.value,
              label: opt.label,
              displayValue: opt.label
            }));
          }
        }

        this.isMultiSelectMode = true;
        this.showSuggestions = true;
        this.selectedValues = [];
        this.emitChange();
        return;
      }
    }

    // Default token removal
    this.tokens.pop();
    this.resetCurrentState();
    this.emitChange();
  }

  /**
   * Resets the current state
   * @example Used after removing tokens
   */
  private resetCurrentState() {
    let operand = null;
    let operator = null;
    let foundOperand = false;
    let lastToken = this.tokens[this.tokens.length - 1];
    
    // If the last token is a value or closing bracket, we should allow logical operators
    if (lastToken && (this.isValueToken(lastToken) || (this.isBracketToken(lastToken) && lastToken.value === ')'))) {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isMultiSelectMode = false;
      this.isAutocompleteMode = false;
      this.selectedValues = [];
      this.showSuggestions = true;
      // Show logical operators
      this.suggestions = this.config.logicalOperators.map(op => ({
        type: 'logical' as const,
        value: op.value,
        label: op.label,
        displayValue: op.label
      }));
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

    // Update current state
    this.currentOperand = operand;
    this.currentOperator = operator;
    
    // If we have an operand but no operator, show operators
    if (this.currentOperand && !this.currentOperator) {
      this.isMultiSelectMode = false;
      this.isAutocompleteMode = false;
      this.selectedValues = [];
      this.showSuggestions = true;
      // Show operators
      this.suggestions = this.config.operators
        .filter(op => op.applicableTypes.includes(this.currentOperand!.type))
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));
      return;
    }

    // Handle both IN and NOT IN operators consistently
    if (this.currentOperator && (this.currentOperator.symbol === 'IN' || this.currentOperator.symbol === 'NOT IN') && this.currentOperand) {
      this.isMultiSelectMode = true;
      this.isAutocompleteMode = this.currentOperand.type === 'autocomplete';
      this.selectedValues = [];
      this.showSuggestions = true;
      // Show value suggestions for IN/NOT IN operator
      if (this.currentOperand.options) {
        this.suggestions = this.currentOperand.options.map(opt => ({
          type: 'value' as const,
          value: opt.value,
          label: opt.label,
          displayValue: opt.label
        }));
      }
    }
  }

  /**
   * Updates suggestions based on input
   * @param input Current input value
   * @example Shows relevant suggestions based on current state
   */
  private updateSuggestionsForInput(input: string) {
    this.suggestions = [];
    const lowercaseInput = input.toLowerCase();
    const lastToken = this.tokens[this.tokens.length - 1];

    // Reset suggestions if we're in a clean state or after a logical operator
    if (this.tokens.length === 0 || (lastToken && this.isLogicalToken(lastToken))) {
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

    // Special handling for compound operators and text operators
    if (this.currentOperand && !this.currentOperator) {
      const isTextOperand = this.currentOperand.type === 'text' || this.currentOperand.type === 'autocomplete';
      const operators = this.config.operators
        .filter(op => {
          // For text fields, show all applicable operators including LIKE
          if (isTextOperand) {
            return op.applicableTypes.includes(this.currentOperand!.type) &&
                   (op.label.toLowerCase().includes(lowercaseInput) ||
                    op.symbol.toLowerCase().includes(lowercaseInput));
          }
          // For other types, show operators that start with the input
          return op.applicableTypes.includes(this.currentOperand!.type) &&
                 (op.symbol.toLowerCase().startsWith(lowercaseInput) ||
                  op.label.toLowerCase().includes(lowercaseInput));
        })
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));

      this.suggestions = operators;
      return;
    }

    // Handle value input after operator
    if (this.currentOperand && this.currentOperator) {
      // For non-select type fields (text, number, date), treat input as direct value
      if (!['select', 'multiselect', 'autocomplete'].includes(this.currentOperand.type)) {
        if (input) {
          this.suggestions = [{
            type: 'value',
            value: input,
            label: input,
            displayValue: input
          }];
        } else {
          this.suggestions = [];
        }
        return;
      }

      // For select/multiselect/autocomplete fields
      if (this.isMultiSelectMode || this.currentOperator.symbol === 'IN' || this.currentOperator.symbol === 'NOT IN') {
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

      // For non-IN operators with select/autocomplete fields
      if (this.currentOperand.options) {
        this.suggestions = this.currentOperand.options
          .filter(opt => opt.label.toLowerCase().includes(lowercaseInput))
          .map(opt => ({
            type: 'value' as const,
            value: opt.value,
            label: opt.label,
            displayValue: opt.label
          }));
      }
      return;
    }

    // Show logical operators after a complete value token
    if (lastToken && (this.isValueToken(lastToken) || (this.isBracketToken(lastToken) && lastToken.value === ')'))) {
      this.suggestions = this.config.logicalOperators
        .filter(op => op.label.toLowerCase().includes(lowercaseInput))
        .map(op => ({
          type: 'logical' as const,
          value: op.value,
          label: op.label,
          displayValue: op.label
        }));
    }
  }

  /**
   * Validates the current filter
   * @returns Error message or null if valid
   * @example Checks for incomplete expressions and bracket matching
   */
  private validateFilter(): string | null {
    if (this.tokens.length === 0) {
      return null;
    }

    let openBrackets = 0;
    let lastToken: FilterToken | null = null;
    let operandCount = 0;
    let operatorCount = 0;
    let valueCount = 0;
    let inClauseActive = false;

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      // Track bracket count
      if (this.isBracketToken(token)) {
        if (this.isOpenBracket(token)) {
          openBrackets++;
          // Check if this is part of an IN clause
          if (lastToken && this.isOperatorToken(lastToken) && lastToken.value === 'IN') {
            inClauseActive = true;
          }
        } else if (this.isCloseBracket(token)) {
          openBrackets--;
          if (openBrackets < 0) {
            return 'Unmatched closing bracket';
          }
          // End of IN clause
          if (inClauseActive && openBrackets === 0) {
            inClauseActive = false;
            valueCount++; // Count the entire IN clause as one value
          }
        }
        lastToken = token;
        continue;
      }

      // Validate token sequence
      if (lastToken) {
        // After a closing bracket, only logical operators or closing brackets are allowed
        if (this.isCloseBracket(lastToken)) {
          const isValidNextToken = 
            this.isLogicalToken(token) || 
            this.isCloseBracket(token);
          if (!isValidNextToken) {
            return 'After a closing bracket, only logical operators or another closing bracket are allowed';
          }
        }

        // After a logical operator, only operands or opening brackets are allowed
        if (this.isLogicalToken(lastToken)) {
          const isValidNextToken = 
            this.isOperandToken(token) || 
            this.isOpenBracket(token);
          if (!isValidNextToken) {
            return 'After a logical operator, an operand or opening bracket is expected';
          }
        }

        // After an operand, only operators are allowed
        if (this.isOperandToken(lastToken)) {
          if (!this.isOperatorToken(token)) {
            return 'After an operand, an operator is expected';
          }
        }

        // After an operator, handle IN operator specially
        if (this.isOperatorToken(lastToken)) {
          if (lastToken.value === 'IN') {
            if (!this.isOpenBracket(token)) {
              return 'After IN operator, an opening bracket is expected';
            }
          } else if (!inClauseActive && !this.isValueToken(token)) {
            return 'After an operator, a value is expected';
          }
        }

        // After a value in an IN clause, allow comma or closing bracket
        if (this.isValueToken(lastToken) && inClauseActive) {
          const isValidNextToken = 
            (this.isOperatorToken(token) && token.value === ',') || 
            this.isCloseBracket(token);
          if (!isValidNextToken) {
            return 'In an IN clause, values must be separated by commas';
          }
        }
        // After a value outside IN clause, only logical operators or closing brackets are allowed
        else if (this.isValueToken(lastToken) && !inClauseActive) {
          const isValidNextToken = 
            this.isLogicalToken(token) || 
            this.isCloseBracket(token);
          if (!isValidNextToken) {
            return 'After a value, a logical operator or closing bracket is expected';
          }
        }

        // After a comma in IN clause, only values are allowed
        if (this.isOperatorToken(lastToken) && lastToken.value === ',') {
          if (!this.isValueToken(token)) {
            return 'After a comma in IN clause, a value is expected';
          }
        }
      }

      // Track operand-operator-value groups
      if (this.isOperandToken(token)) operandCount++;
      if (this.isOperatorToken(token) && token.value !== ',') operatorCount++;
      if (this.isValueToken(token) && !inClauseActive) valueCount++;

      lastToken = token;
    }

    // Check for unclosed brackets
    if (openBrackets > 0) {
      return 'Unclosed opening bracket';
    }

    // Check for incomplete conditions
    if (operandCount !== operatorCount || operatorCount !== valueCount) {
      return 'Incomplete condition';
    }

    return null;
  }

  /**
   * Groups tokens into logical groups
   * @returns Array of token groups
   * @example Groups tokens for processing into SQL/ag-Grid filters
   */
  private groupFilterTokens() {
    const filterGroups = [];
    let currentGroup: FilterToken[] = [];
    let bracketStack = 0;
    let inClauseActive = false;

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      // Handle brackets
      if (this.isBracketToken(token)) {
        if (this.isOpenBracket(token)) {
          bracketStack++;
          // Start of IN clause
          if (i > 0 && this.tokens[i - 1].type === 'operator' && this.tokens[i - 1].value === 'IN') {
            inClauseActive = true;
          }
        } else if (this.isCloseBracket(token)) {
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

  /**
   * Converts operator to ag-Grid filter type
   * @param operandType Type of operand
   * @param operator Operator symbol
   * @returns ag-Grid filter type
   * @example Converts "LIKE" to "contains"
   */
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

  /**
   * Generates ag-Grid filter from token groups
   * @param filterGroups Array of token groups
   * @returns ag-Grid composite filter model
   * @example Converts tokens to ag-Grid filter format
   */
  private generateAgGridFilter(filterGroups: FilterToken[][]): AgGridCompositeFilterModel {
    if (filterGroups.length === 0) return { filterType: 'multi', conditions: [] };

    const createAgGridCondition = (group: FilterToken[]): AgGridFilterModel => {
      const operand = group.find(t => t.type === 'operand');
      const operator = group.find(t => t.type === 'operator');
      const values = group.filter(t => t.type === 'value');
      
      if (!operand) throw new Error('No operand found in filter group');
      
      const operandConfig = this.config.operands.find(op => op.name === operand.value);
      if (!operandConfig) throw new Error(`No operand config found for ${operand.value}`);

      // Handle Text Filter with LIKE operators
      if (operandConfig.type === 'text' || operandConfig.type === 'autocomplete') {
        const value = values[0]?.value || '';
        let filterValue = value;
        let filterType = this.convertToAgGridFilterType('text', operator?.value || '=');

        // Handle LIKE patterns
        if (operator?.value === 'LIKE' || operator?.value === 'NOT LIKE') {
          if (value.startsWith('%') && value.endsWith('%')) {
            filterType = operator.value === 'LIKE' ? 'contains' : 'notContains';
            filterValue = value.slice(1, -1); // Remove % from both ends
          } else if (value.startsWith('%')) {
            filterType = operator.value === 'LIKE' ? 'endsWith' : 'notEqual';
            filterValue = value.slice(1); // Remove leading %
          } else if (value.endsWith('%')) {
            filterType = operator.value === 'LIKE' ? 'startsWith' : 'notEqual';
            filterValue = value.slice(0, -1); // Remove trailing %
          }
        }

        return {
          type: 'text',
          field: operand.value,
          filterType,
          filter: filterValue
        };
      }

      // Handle Set Filter (IN operator)
      if (operator?.value === 'IN' || operator?.value === 'NOT IN' || 
          operandConfig.type === 'select' || operandConfig.type === 'multiselect') {
        return {
          type: 'set',
          field: operand.value,
          values: values.map(v => v.value)
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

  /**
   * Emits filter changes
   * @example Generates SQL and ag-Grid filters and emits changes
   */
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
          if (token.value === 'STARTS WITH') {
            sql += ' LIKE ';
          } else if (token.value === 'ENDS WITH') {
            sql += ' LIKE ';
          } else {
            sql += token.value === ',' ? token.value : ` ${token.value} `;
          }
        } else if (token.type === 'value') {
          const operand = this.tokens
            .slice(0, index)
            .reverse()
            .find(t => t.type === 'operand');
          
          const operandConfig = operand && this.config.operands.find(op => op.name === operand.value);
          const operator = this.tokens
            .slice(0, index)
            .reverse()
            .find(t => t.type === 'operator');
          
          // Handle string values (text, select, multiselect, autocomplete)
          if (operandConfig?.type === 'text' || 
              operandConfig?.type === 'select' || 
              operandConfig?.type === 'multiselect' || 
              operandConfig?.type === 'autocomplete') {
            // Handle LIKE patterns
            if (operator?.value === 'LIKE' || operator?.value === 'NOT LIKE') {
              sql += `'%${token.value}%'`; // Wrap with % for contains
            } else if (operator?.value === 'STARTS WITH') {
              sql += `'${token.value}%'`; // Add % at the end for starts with
            } else if (operator?.value === 'ENDS WITH') {
              sql += `'%${token.value}'`; // Add % at the start for ends with
            } else if (operator?.value === 'IN' || operator?.value === 'NOT IN') {
              sql += `'${token.value}'`; // Just wrap in quotes for IN/NOT IN
            } else {
              sql += `'${token.value}'`; // Default string wrapping
            }
          } else if (operandConfig?.type === 'date') {
            // Handle date values
            sql += `'${token.value}'`; // Dates should also be quoted
          } else {
            // Numbers and other types
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

  /**
   * Updates the position of the suggestions dropdown
   * @example Positions dropdown below cursor
   */
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

  private isBracketToken(token: FilterToken): token is BracketToken {
    return token.type === 'bracket' && (token.value === '(' || token.value === ')');
  }

  private isOpenBracket(token: FilterToken): token is BracketToken & { value: '(' } {
    return this.isBracketToken(token) && token.value === '(';
  }

  private isCloseBracket(token: FilterToken): token is BracketToken & { value: ')' } {
    return this.isBracketToken(token) && token.value === ')';
  }

  private isOperatorToken(token: FilterToken): token is OperatorToken {
    return token.type === 'operator';
  }

  private isValueToken(token: FilterToken): token is ValueToken {
    return token.type === 'value';
  }

  private isLogicalToken(token: FilterToken): token is LogicalToken {
    return token.type === 'logical';
  }

  private isOperandToken(token: FilterToken): token is OperandToken {
    return token.type === 'operand';
  }
} 