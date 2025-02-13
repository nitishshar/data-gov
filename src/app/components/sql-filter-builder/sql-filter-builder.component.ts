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

  /** Whether to show IN filter values in collapsed mode */
  @Input() collapseInFilterValues: boolean = false;

  /** Number of values to show when collapsed (default 2) */
  @Input() collapsedValueCount: number = 2;

  /** More values text template */
  @Input() moreValuesText: string = '+{count} more';

  /** Event emitter that emits either SQL string or ag-Grid filter object based on outputFormat */
  @Output() filterChange = new EventEmitter<string | AgGridCompositeFilterModel>();

  /** Reference to the input element for handling cursor position and suggestions */
  @ViewChild('filterInput') filterInput!: ElementRef;

  /** Reference to the date input element for date fields */
  @ViewChild('dateInput') dateInput!: ElementRef;

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

  /** Currently active IN clause for editing */
  private activeInClause: { operand: FilterOperand | null, values: FilterSuggestion[] } | null = null;

  /** Whether the filter builder is in edit mode */
  isEditMode = false;

  /** Whether the SQL has been copied to clipboard */
  isCopied = false;

  /** Copy timeout reference */
  private copyTimeout: any;

  /** Currently active value being edited */
  private activeValueEdit: { index: number, token: ValueToken } | null = null;

  /**
   * Whether to show the generated SQL preview
   * @returns boolean based on config setting
   * @example
   * <div *ngIf="showGeneratedSql">SQL: {{ generatedSql }}</div>
   */
  get showGeneratedSql(): boolean {
    return this.config.showGeneratedSql ?? true;
  }

  // Add getter for theme
  get currentTheme(): 'classic' | 'modern' | 'legacy' | 'business' | 'professional' {
    return this.config.theme || 'classic'; // Default to classic style
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
  public isMultiSelectAutocomplete: boolean = false;

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
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
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
    
    // If we're editing a value, update suggestions based on the input
    if (this.activeValueEdit) {
      this.inputValue = input;
      if (this.activeValueEdit.token.operandType === 'text' || this.activeValueEdit.token.operandType === 'number') {
        this.suggestions = [{
          type: 'value',
          value: input,
          label: input,
          displayValue: input,
          operandType: this.activeValueEdit.token.operandType
        }];
      }
      return;
    }

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
    
    // Show operand suggestions after opening bracket
    this.showSuggestions = true;
    this.suggestions = this.config.operands.map(op => ({
      type: 'operand' as const,
      value: op.name,
      label: op.label,
      displayValue: op.label,
      operandType: op.type
    }));
    
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
   * Handles input blur
   * @param event Focus event
   * @example Hides suggestions dropdown on blur
   */
  onBlur(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.suggestions-dropdown')) {
      setTimeout(() => {
        // If we were editing a value, reset the state
        if (this.activeValueEdit) {
          this.activeValueEdit = null;
          this.showSuggestions = false;
          this.inputValue = '';
          return;
        }

        // Reset operator editing state if we were editing an operator
        if (this.currentOperator && this.currentOperand) {
          const lastToken = this.tokens[this.tokens.length - 1];
          this.currentOperator = null;
          this.currentOperand = null;
          
          // Show appropriate suggestions based on last token
          this.showSuggestions = true;
          if (this.isValueToken(lastToken) || (this.isBracketToken(lastToken) && lastToken.value === ')')) {
            this.suggestions = this.config.logicalOperators.map(op => ({
              type: 'logical' as const,
              value: op.value,
              label: op.label,
              displayValue: op.label
            }));
          } else if (this.isLogicalToken(lastToken)) {
            this.suggestions = this.config.operands.map(op => ({
              type: 'operand' as const,
              value: op.name,
              label: op.label,
              displayValue: op.label,
              operandType: op.type
            }));
          }
        } else {
          this.showSuggestions = false;
          this.selectedSuggestionIndex = -1;
          if (!this.isMultiSelectAutocomplete) {
            this.isAutocompleteMode = false;
          }
        }
      }, 200);
    }
  }

  /**
   * Handles input focus
   * @example Shows suggestions dropdown on focus
   */
  onFocus() {
    this.showSuggestions = true;
    // Reset single-select mode when focusing on the main input
    this.isSingleSelectSearchMode = false;
    
    if (!this.currentOperand) {
      // Show operand suggestions
      this.updateSuggestionsForInput(this.inputValue);
    } else if (!this.currentOperator) {
      // Show operator suggestions
      const applicableOperators = this.config.operators
        .filter(op => op.applicableTypes.includes(this.currentOperand!.type))
        .map(op => ({
          type: 'operator' as const,
          value: op.symbol,
          label: op.label,
          displayValue: op.label
        }));
      this.suggestions = applicableOperators;
    }
    
    setTimeout(() => this.updateDropdownPosition());
  }

  /**
   * Handles keyboard events
   * @param event Keyboard event
   * @example Handles navigation and selection in suggestions
   */
  onKeyDown(event: KeyboardEvent) {
    // If editing a value and Enter is pressed, update the value
    if (this.activeValueEdit && event.key === 'Enter') {
      event.preventDefault();
      this.selectSuggestion({
        type: 'value',
        value: this.inputValue,
        label: this.inputValue,
        displayValue: this.inputValue,
        operandType: this.activeValueEdit.token.operandType
      });
      return;
    }

    // If editing a value and Escape is pressed, cancel editing
    if (this.activeValueEdit && event.key === 'Escape') {
      event.preventDefault();
      this.activeValueEdit = null;
      this.showSuggestions = false;
      this.inputValue = '';
      return;
    }

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
    // If we're editing a value, update it instead of adding a new one
    if (this.activeValueEdit && suggestion.type === 'value') {
      this.tokens[this.activeValueEdit.index] = {
        type: 'value',
        value: suggestion.value,
        displayValue: suggestion.displayValue,
        operandType: this.currentOperand?.type || suggestion.operandType,
        groupId: this.activeValueEdit.token.groupId
      };
      
      // Reset state
      this.activeValueEdit = null;
      this.showSuggestions = false;
      this.inputValue = '';
      this.emitChange();
      return;
    }
  // If we're editing an existing operator, handle it differently
  if (this.currentOperator && this.currentOperand && suggestion.type === 'operator') {
    this.onOperatorChange(suggestion);
    return;
  }
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
      setTimeout(() => this.updateDropdownPosition());
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
        // Special handling for value selection when we have currentOperand and currentOperator
        if (this.currentOperand && this.currentOperator) {
          token = {
            type: 'value',
            value: suggestion.value,
            displayValue: suggestion.displayValue,
            operandType: this.currentOperand.type, // Set operandType from currentOperand
            groupId: this.tokens[this.tokens.length - 1]?.groupId
          };
          this.tokens.push(token);
          this.inputValue = '';
          this.selectedSuggestionIndex = -1;
          
          // Reset states but keep suggestions visible for logical operators
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
          setTimeout(() => this.updateDropdownPosition());
          this.emitChange();
          return;
        }
        token = {
          type: 'value',
          value: suggestion.value,
          displayValue: suggestion.displayValue,
          operandType: this.currentOperand?.type || suggestion.operandType
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
      setTimeout(() => this.updateDropdownPosition());
    } else if (suggestion.type === 'operator') {
      // If we're editing an existing operator, replace it
      if (this.currentOperator && this.currentOperand) {
        // Find the operator token to replace
        const operatorIndex = this.tokens.findIndex(t => 
          this.isOperatorToken(t) && 
          t.value === this.currentOperator?.symbol &&
          // Look for the operator that's part of the current operand's group
          this.findOperandForOperator(t as OperatorToken)?.value === this.currentOperand?.name
        );
        
        if (operatorIndex !== -1) {
          // Replace the existing operator
          this.tokens[operatorIndex] = {
            type: 'operator',
            value: suggestion.value,
            displayValue: suggestion.label
          };
        }
      }
      this.currentOperator = this.config.operators.find(op => op.symbol === suggestion.value) || null;
      if (this.currentOperand?.type === 'date') {
        this.showSuggestions = true;
        this.suggestions = [];
        setTimeout(() => {
          if (this.dateInput?.nativeElement) {
            this.dateInput.nativeElement.showPicker();
          }
        });
        return;
      }
      if (this.shouldShowValueSelect) {
        this.showSuggestions = true;
        this.updateSuggestionsForInput('');
        setTimeout(() => this.updateDropdownPosition());
      } else if (this.shouldShowAutocomplete) {
        this.isAutocompleteMode = true;
        this.showSuggestions = true;
        setTimeout(() => this.updateDropdownPosition());
      } else {
        this.showSuggestions = false;
      }
    } else if (suggestion.type === 'value') {
      // If we're in single-select edit mode, replace the existing value
      if (this.isSingleSelectSearchMode && this.activeValueEdit) {
        // Update the existing token instead of adding a new one
        const token = this.tokens[this.activeValueEdit.index];
        if (token && token.type === 'value') {
          token.value = suggestion.value;
          token.displayValue = suggestion.label;
          this.showSuggestions = false;
          this.isSingleSelectSearchMode = false;
          this.activeValueEdit = null;
          this.emitChange();
          return;
        }
      }

      // Regular flow for adding new values (not editing)
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
      setTimeout(() => this.updateDropdownPosition());
    } else if (suggestion.type === 'logical') {
      this.currentOperand = null;
      this.currentOperator = null;
      this.isAutocompleteMode = false;
      this.isMultiSelectMode = false;
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
      setTimeout(() => this.updateDropdownPosition());
      // Reset multi-select mode so we don't keep showing multi-select suggestions:
      this.isMultiSelectMode = false;
      this.isMultiSelectAutocomplete = false;
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

    if (this.activeInClause) {
      // Find the IN clause tokens and replace them
      let inClauseStart = -1;
      let inClauseEnd = -1;
      let foundIN = false;

      for (let i = 0; i < this.tokens.length; i++) {
        const token = this.tokens[i];
        if (this.isOperatorToken(token) && (token.value === 'IN' || token.value === 'NOT IN')) {
          inClauseStart = i;
          foundIN = true;
        } else if (foundIN && this.isCloseBracket(token)) {
          inClauseEnd = i;
          break;
        }
      }

      if (inClauseStart !== -1 && inClauseEnd !== -1) {
        // Keep tokens before IN clause
        const newTokens = this.tokens.slice(0, inClauseStart + 1);
        
        // Add opening bracket
        newTokens.push({ type: 'bracket', value: '(', displayValue: '(' });

        // Add selected values
        this.selectedValues.forEach((value, index) => {
          if (index > 0) {
            newTokens.push({ type: 'operator', value: ',', displayValue: ',' });
          }
          newTokens.push({
            type: 'value',
            value: value.value,
            displayValue: value.label
          });
        });

        // Add closing bracket
        newTokens.push({ type: 'bracket', value: ')', displayValue: ')' });

        // Add remaining tokens after IN clause
        newTokens.push(...this.tokens.slice(inClauseEnd + 1));

        this.tokens = newTokens;
      }

      this.activeInClause = null;
    } else {
      // Original behavior for new IN clauses
      const openBracket: BracketToken = {
        type: 'bracket',
        value: '(',
        displayValue: '('
      };
      this.tokens.push(openBracket);

      this.selectedValues.forEach((value, index) => {
        if (index > 0) {
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

      const closeBracket: BracketToken = {
        type: 'bracket',
        value: ')',
        displayValue: ')'
      };
      this.tokens.push(closeBracket);
    }

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
        // We're in an IN clause
        if (this.isCloseBracket(lastToken)) {
          // Remove the closing bracket
          this.tokens.pop();
        } else if (this.isValueToken(lastToken)) {
          // For IN filter values, remove the entire value including comma if it exists
          this.tokens.pop(); // Remove the value
          
          // Look at previous token for comma
          const previousToken = this.tokens[this.tokens.length - 1];
          if (this.isOperatorToken(previousToken) && previousToken.value === ',') {
            this.tokens.pop(); // Remove the comma
          } else {
            // If no comma before this value, it might be the first value
            // Check if we should remove the opening bracket and IN operator
            const nextToken = this.tokens[this.tokens.length - 1];
            if (this.isOpenBracket(nextToken)) {
              this.tokens.pop(); // Remove opening bracket
              this.tokens.pop(); // Remove IN operator
            }
          }
        } else if (this.isOperatorToken(lastToken) && lastToken.value === ',') {
          // If on a comma, remove both the comma and the value before it
          this.tokens.pop(); // Remove the comma
          if (this.tokens.length > 0 && this.isValueToken(this.tokens[this.tokens.length - 1])) {
            this.tokens.pop(); // Remove the value before the comma
          }
        }

        // Reset states and update suggestions
        this.showSuggestions = true;
        this.suggestions = [];
        this.selectedValues = [];
        this.inputValue = '';
        
        // If we still have an IN operator active, set up for more values
        const lastRemainingToken = this.tokens[this.tokens.length - 1];
        if (this.isOperatorToken(lastRemainingToken) && (lastRemainingToken.value === 'IN' || lastRemainingToken.value === 'NOT IN')) {
          this.currentOperator = this.config.operators.find(op => op.symbol === lastRemainingToken.value) || null;
          const operandToken = this.tokens[this.tokens.length - 2];
          if (this.isOperandToken(operandToken)) {
            this.currentOperand = this.config.operands.find(op => op.name === operandToken.value) || null;
          }
          this.isMultiSelectMode = true;
          this.isAutocompleteMode = this.currentOperand?.type === 'autocomplete';
          
          // Update suggestions
          this.updateSuggestionsForInput('');
          setTimeout(() => this.updateDropdownPosition());
        }

        this.emitChange();
        return;
      }
    }

    // Default token removal for non-IN clause tokens
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

    // For date type fields, create a suggestion with the selected date
    if (this.currentOperand?.type === 'date' && this.currentOperator) {
      if (input) {
        // Format the date as YYYY-MM-DD for SQL
        const dateValue = new Date(input).toISOString().split('T')[0];
        this.suggestions = [{
          type: 'value',
          value: dateValue,
          label: dateValue,
          displayValue: dateValue,
          operandType: 'date'
        }];
      } else {
        this.suggestions = [];
      }
      return;
    }

    // Reset suggestions if we're in a clean state, after a logical operator, or after an opening bracket
    if (this.tokens.length === 0 || 
        (lastToken && (this.isLogicalToken(lastToken) || (this.isBracketToken(lastToken) && lastToken.value === '(')))
    ) {
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
          // Filter options based on input
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
          this.currentOperand.optionsLoader(input).subscribe(
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
        // Filter options based on input
        this.suggestions = this.currentOperand.options
          .filter(opt => opt.label.toLowerCase().includes(lowercaseInput))
          .map(opt => ({
            type: 'value' as const,
            value: opt.value,
            label: opt.label,
            displayValue: opt.label
          }));
      } else if (this.currentOperand.optionsLoader) {
        // Load options for select fields with optionsLoader
        this.isLoading = true;
        this.currentOperand.optionsLoader(input).subscribe(
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

    // Check if the last token is a logical operator
    const lastTokenInSequence = this.tokens[this.tokens.length - 1];
    if (this.isLogicalToken(lastTokenInSequence)) {
      return 'Expression cannot end with a logical operator';
    }

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      const isLastToken = i === this.tokens.length - 1;

      // Track bracket count
      if (this.isBracketToken(token)) {
        if (this.isOpenBracket(token)) {
          openBrackets++;
          // Check if this is part of an IN clause
          if (lastToken && this.isOperatorToken(lastToken) && (lastToken.value === 'IN' || lastToken.value === 'NOT IN')) {
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
          if (lastToken.value === 'IN' || lastToken.value === 'NOT IN') {
            if (!this.isOpenBracket(token)) {
              return 'After IN/NOT IN operator, an opening bracket is expected';
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
        // unless it's the last token in the sequence
        else if (this.isValueToken(lastToken) && !inClauseActive && !isLastToken) {
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

    const createAgGridCondition = (group: FilterToken[]): AgGridFilterModel | AgGridCompositeFilterModel => {
      const operand = group.find(t => t.type === 'operand');
      const operator = group.find(t => t.type === 'operator');
      const values = group.filter(t => t.type === 'value');
      
      if (!operand) throw new Error('No operand found in filter group');
      
      const operandConfig = this.config.operands.find(op => op.name === operand.value);
      if (!operandConfig) throw new Error(`No operand config found for ${operand.value}`);

      // Handle Set Filter (IN, NOT IN, and != operators for select/multiselect)
      if (operator?.value === 'IN' || operator?.value === 'NOT IN' || 
          operator?.value === '!=' && (operandConfig.type === 'select' || operandConfig.type === 'multiselect') ||
          operandConfig.type === 'select' || operandConfig.type === 'multiselect') {
        
        // For NOT IN and != operators, create a composite filter with notEqual conditions
        if (operator?.value === 'NOT IN' || operator?.value === '!=') {
          const notEqualFilter: AgGridCompositeFilterModel = {
            filterType: 'multi',
            operator: 'AND',
            conditions: values.map(v => ({
              type: 'text',
              field: operand.value,
              filterType: 'notEqual',
              filter: v.value
            }))
          };
          return notEqualFilter;
        }
        // For regular IN operator and equals
        return {
          type: 'set',
          field: operand.value,
          values: values.map(v => v.value)
        };
      }

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
          // Handle nested composite filters (like NOT IN)
          if ('filterType' in condition && condition.filterType === 'multi') {
            result.conditions.push(...condition.conditions);
          } else {
            result.conditions.push(condition as AgGridFilterModel);
          }

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

  /**
   * Gets the collapsed version of tokens for IN clauses
   */
  private getCollapsedTokens(): FilterToken[] {
    const result: FilterToken[] = [];
    let inClauseStart = -1;
    let inClauseValues: FilterToken[] = [];
    let isInClause = false;

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      if (this.isOperatorToken(token) && (token.value === 'IN' || token.value === 'NOT IN')) {
        isInClause = true;
        inClauseStart = result.length;
        result.push(token);
        continue;
      }

      if (isInClause) {
        if (this.isCloseBracket(token)) {
          isInClause = false;
          // Always collapse multiselect values
          // Add opening bracket
          result.push({ type: 'bracket', value: '(', displayValue: '(' });
          
          // Add first value
          if (inClauseValues.length > 0) {
            result.push(inClauseValues[0]);
          }

          // Add the collapsed indicator if there are more values
          if (inClauseValues.length > 1) {
            const remainingCount = inClauseValues.length - 1;
            result.push({
              type: 'value',
              value: this.moreValuesText.replace('{count}', remainingCount.toString()),
              displayValue: this.moreValuesText.replace('{count}', remainingCount.toString()),
              isCollapsed: true,
              fullValues: inClauseValues,
              operandType: 'multiselect'
            } as ValueToken);
          }

          // Add closing bracket
          result.push({ type: 'bracket', value: ')', displayValue: ')' });
          inClauseValues = [];
        } else if (this.isValueToken(token)) {
          inClauseValues.push(token);
        }
        continue;
      }

      result.push(token);
    }

    return result;
  }

  /**
   * Gets the display tokens with group IDs
   * This method handles the collapsing of IN filter values when enabled
   */
  get displayTokens(): FilterToken[] {
    const tokens = !this.collapseInFilterValues ? this.tokens : this.getCollapsedTokens();
    this.assignGroupIds();
    return tokens;
  }

  /**
   * Handles click on a collapsed IN filter value
   * @param token The token that was clicked
   */
  onCollapsedValueClick(token: ValueToken) {
    if (!token.isCollapsed || !token.fullValues) return;

    // Find the operand for this IN clause
    let operandToken: OperandToken | null = null;
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      if (this.isOperandToken(this.tokens[i])) {
        operandToken = this.tokens[i] as OperandToken;
        break;
      }
    }

    if (!operandToken) return;

    const operand = this.config.operands.find(op => op.name === operandToken!.value);
    if (!operand) return;

    // Set up the active IN clause for editing
    this.activeInClause = {
      operand,
      values: token.fullValues.map((v: FilterToken) => ({
        type: 'value' as const,
        value: v.value,
        label: v.displayValue || v.value,
        displayValue: v.displayValue || v.value
      }))
    };

    // Set up multi-select mode
    this.currentOperand = operand;
    this.currentOperator = this.config.operators.find(op => op.symbol === 'IN') || null;
    this.isMultiSelectMode = true;
    this.isAutocompleteMode = operand.type === 'autocomplete';
    this.selectedValues = this.activeInClause?.values || [];
    this.showSuggestions = true;
    
    // Update suggestions
    this.updateSuggestionsForInput('');
    setTimeout(() => this.updateDropdownPosition());
  }

  /** Finds the operand token associated with an operator token */
  private findOperandForOperator(operatorToken: OperatorToken): OperandToken | null {
    const operatorIndex = this.tokens.findIndex(t => t === operatorToken);
    if (operatorIndex <= 0) return null;

    // Look backwards for the first operand token
    for (let i = operatorIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (this.isOperandToken(token)) {
        return token;
      }
    }
    return null;
  }

  /** Handles click on an operator token */
  onOperatorClick(token: OperatorToken, event: MouseEvent) {
    if (!this.isEditingAllowed) return;

    // Find the operand for this operator
    const operandToken = this.findOperandForOperator(token);
    if (!operandToken) return;

    const operand = this.config.operands.find(op => op.name === operandToken.value);
    if (!operand) return;

    // Set current state to enable proper operator replacement
    this.currentOperand = operand;
    this.currentOperator = this.config.operators.find(op => op.symbol === token.value) || null;

    this.showSuggestions = true;
    this.isSingleSelectSearchMode = false; // Ensure we're not in select mode
    
    // Show applicable operators as suggestions
    const isInOperator = token.value === 'IN' || token.value === 'NOT IN';
    const applicableOperators = this.config.operators
      .filter(op => {
        if (isInOperator) {
          // Only show IN and NOT IN operators
          return op.symbol === 'IN' || op.symbol === 'NOT IN';
        }
        // For other operators, show all applicable operators except IN/NOT IN
        return op.applicableTypes.includes(operand.type) && 
               op.symbol !== 'IN' && 
               op.symbol !== 'NOT IN';
      })
      .map(op => ({
        type: 'operator' as const,
        value: op.symbol,
        label: op.label,
        displayValue: op.label
      }));
    
    this.suggestions = applicableOperators;
    
    // Position dropdown near the clicked operator
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
  }

  /** Handles click on a logical operator token */
  onLogicalOperatorClick(token: LogicalToken, event: MouseEvent) {
    if (!this.isEditingAllowed) return;

    this.showSuggestions = true;
    this.isSingleSelectSearchMode = false; // Ensure we're not in select mode
    
    // Show logical operators as suggestions
    this.suggestions = this.config.logicalOperators.map(op => ({
      type: 'logical' as const,
      value: op.value,
      label: op.label,
      displayValue: op.label
    }));
    
    // Position dropdown near the clicked logical operator
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
  }

  /** Handles operator change selection */
  onOperatorChange(suggestion: FilterSuggestion) {
    if (!this.currentOperator || !this.currentOperand) return;

    // Find the operator token to replace
    const operatorIndex = this.tokens.findIndex(t => 
      this.isOperatorToken(t) && 
      t.value === this.currentOperator?.symbol &&
      // Look for the operator that's part of the current operand's group
      this.findOperandForOperator(t as OperatorToken)?.value === this.currentOperand?.name
    );
    if (operatorIndex === -1) return;

    // Replace the operator with the new one
    this.tokens[operatorIndex] = {
      type: 'operator',
      value: suggestion.value,
      displayValue: suggestion.displayValue,
      operandType: suggestion.operandType
    };

    // Check if we have a value after this operator
    const nextToken = this.tokens[operatorIndex + 1];
    const hasValue = nextToken && (this.isValueToken(nextToken) || 
                                (this.isBracketToken(nextToken) && nextToken.value === '(' && suggestion.value.includes('IN')));

    // Reset state
    this.showSuggestions = hasValue; // Only show suggestions if we don't have a value
    this.currentOperand = hasValue ? null : this.currentOperand;
    this.currentOperator = hasValue ? null : this.config.operators.find(op => op.symbol === suggestion.value) || null;

    if (hasValue) {
      // If we have a value, show logical operators
      this.suggestions = this.config.logicalOperators.map(op => ({
        type: 'logical' as const,
        value: op.value,
        label: op.label,
        displayValue: op.label
      }));
    } else {
      // If we don't have a value, prepare for value input
      if (suggestion.value === 'IN' || suggestion.value === 'NOT IN') {
        this.isMultiSelectMode = true;
        this.isAutocompleteMode = this.currentOperand?.type === 'autocomplete';
        this.selectedValues = [];
        this.updateSuggestionsForInput('');
      } else {
        this.showSuggestions = this.shouldShowValueSelect || this.shouldShowAutocomplete;
        if (this.showSuggestions) {
          this.updateSuggestionsForInput('');
        }
      }
    }

    this.emitChange();

    // Move cursor to end of textbox
    setTimeout(() => {
      if (this.filterInput?.nativeElement) {
        this.filterInput.nativeElement.focus();
        this.filterInput.nativeElement.setSelectionRange(
          this.filterInput.nativeElement.value.length,
          this.filterInput.nativeElement.value.length
        );
      }
    });
  }

  /** Toggles edit mode */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  /** Removes a filter group */
  removeFilterGroup(groupId: string) {
    if (!this.isEditingAllowed) return;

    // Find the start and end indices of the group
    const tokens = [...this.tokens];
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (this.isOperandToken(tokens[i]) && tokens[i].groupId === groupId) {
        startIndex = i;
        // Look for the end of this group (value token or closing bracket for IN clauses)
        for (let j = i; j < tokens.length; j++) {
          const token = tokens[j];
          if (token.groupId === groupId) {
            endIndex = j;
          }
        }
        break;
      }
    }

    if (startIndex === -1 || endIndex === -1) return;

    // Check if there's a logical operator after this group that should also be removed
    if (endIndex + 1 < tokens.length && this.isLogicalToken(tokens[endIndex + 1])) {
      endIndex++;
    }
    // Or if there's a logical operator before this group that should be removed
    else if (startIndex > 0 && this.isLogicalToken(tokens[startIndex - 1])) {
      startIndex--;
    }

    // Remove the group
    this.tokens.splice(startIndex, endIndex - startIndex + 1);

    // Reset current state if no tokens left
    if (this.tokens.length === 0) {
      this.currentOperand = null;
      this.currentOperator = null;
      this.showSuggestions = true;
      this.updateSuggestionsForInput('');
    } else {
      // Get the last token after removal
      const lastToken = this.tokens[this.tokens.length - 1];
      
      // Show appropriate suggestions based on the last token
      this.showSuggestions = true;
      if (this.isValueToken(lastToken) || (this.isBracketToken(lastToken) && lastToken.value === ')')) {
        // After a value or closing bracket, show logical operators
        this.suggestions = this.config.logicalOperators.map(op => ({
          type: 'logical' as const,
          value: op.value,
          label: op.label,
          displayValue: op.label
        }));
      } else if (this.isLogicalToken(lastToken)) {
        // After a logical operator, show operands
        this.suggestions = this.config.operands
          .map(op => ({
            type: 'operand' as const,
            value: op.name,
            label: op.label,
            displayValue: op.label,
            operandType: op.type
          }));
      }
    }

    this.emitChange();

    // Focus the input and move cursor to the end
    setTimeout(() => {
      if (this.filterInput?.nativeElement) {
        const input = this.filterInput.nativeElement;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        this.updateDropdownPosition();
      }
    });
  }

  /** Assigns group IDs to tokens */
  private assignGroupIds() {
    let currentGroupId = '';
    let isInGroup = false;

    this.tokens.forEach((token, index) => {
      if (this.isOperandToken(token)) {
        currentGroupId = `group-${index}`;
        isInGroup = true;
        token.groupId = currentGroupId;
      } else if (isInGroup && !this.isLogicalToken(token)) {
        token.groupId = currentGroupId;
      } else if (this.isLogicalToken(token)) {
        isInGroup = false;
      }
    });
  }

  /** Copies the SQL to clipboard */
  copySQL(event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(this.generatedSql).then(() => {
      this.isCopied = true;
      
      // Clear any existing timeout
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      
      // Reset the copied state after 2 seconds
      this.copyTimeout = setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    });
  }

  /** Clears all tokens and resets the filter builder */
  clearAllTokens() {
    this.tokens = [];
    this.currentOperand = null;
    this.currentOperator = null;
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.isAutocompleteMode = false;
    this.isMultiSelectMode = false;
    this.selectedValues = [];
    this.inputValue = '';
    this.bracketCount = 0;
    this.activeValueEdit = null;
    this.activeInClause = null;
    this.emitChange();
  }

  /** Handles click on a value token for editing */
  onValueClick(token: ValueToken, event: MouseEvent) {
    if (!this.isEditingAllowed || !token.operandType) return;

    // If it's not a select/multiselect type, don't show the select UI
    if (token.operandType !== 'select' && token.operandType !== 'multiselect') {
      return;
    }

    // Find the index of the value token
    const tokenIndex = this.tokens.findIndex(t => t === token);
    if (tokenIndex === -1) return;

    // Set up for value editing
    this.activeValueEdit = {
      index: tokenIndex,
      token: token
    };

    // Find the operand for this value
    let operandToken: OperandToken | null = null;
    let operatorToken: OperatorToken | null = null;
    
    // Find the operand and operator for this value by looking backwards
    for (let i = tokenIndex - 1; i >= 0; i--) {
      const currentToken = this.tokens[i];
      if (!operatorToken && this.isOperatorToken(currentToken)) {
        operatorToken = currentToken;
      }
      if (!operandToken && this.isOperandToken(currentToken)) {
        operandToken = currentToken;
        break;
      }
    }

    if (!operandToken) return;

    const operand = this.config.operands.find(op => op.name === operandToken!.value);
    if (!operand) return;

    // Set current state
    this.currentOperand = operand;
    this.currentOperator = operatorToken ? 
      this.config.operators.find(op => op.symbol === operatorToken.value) || null : 
      null;

    // 1) Identify what's being clicked: single select vs. multi select
    this.isSingleSelectSearchMode = (token.operandType === 'select');
    this.isMultiSelectMode = (token.operandType === 'multiselect');

    // 2) DO NOT copy token.value -> this.inputValue. Instead, blank it.
    this.inputValue = '';

    // 3) Show suggestions with empty search 
    this.showSuggestions = true;
    this.isLoading = true;
    
    // If operand has .options or .optionsLoader, load them:
    if (operand.optionsLoader) {
      operand.optionsLoader('').subscribe({
        next: loadedOptions => {
          this.suggestions = loadedOptions.map(opt => ({
            type: 'value',
            value: opt.value,
            label: opt.label,
            displayValue: opt.label,
            operandType: token.operandType
          }));
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading select options:', err);
          this.isLoading = false;
        }
      });
    } else if (operand.options) {
      this.suggestions = operand.options.map(opt => ({
        type: 'value',
        value: opt.value,
        label: opt.label,
        displayValue: opt.label,
        operandType: token.operandType
      }));
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }

    // 4) Re-position dropdown near the clicked token
    setTimeout(() => this.updateDropdownPosition());
  }

  /** Whether editing is allowed without explicitly entering edit mode */
  get allowDirectEditing(): boolean {
    return this.config.defaultEditMode ?? false;
  }

  /** Whether editing is currently allowed */
  get isEditingAllowed(): boolean {
    return this.isEditMode || this.allowDirectEditing;
  }

  /**
   * Returns true if this token is a value token for [text|number] and editing is allowed
   */
  isValueAndEditable(token: FilterToken): boolean {
    return token.type === 'value'
      && (token.operandType === 'text' || token.operandType === 'number')
      && this.isEditingAllowed;
  }

  /**
   * Handle keydown events within tokens so that arrow keys can move
   * the cursor among tokens and backspace can remove tokens if empty.
   */
  onTokenKeyDown(event: KeyboardEvent, token: FilterToken, index: number) {
    // If user presses ArrowLeft at the beginning of this token, focus previous token
    if (event.key === 'ArrowLeft') {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0 && range.collapsed) {
          // Move to previous token if exists
          if (index > 0) {
            event.preventDefault();
            this.focusToken(index - 1, /* placeCursorAtEnd= */ true);
          }
        }
      }
    }
    
    // If user presses ArrowRight at the end of this token, focus next token
    if (event.key === 'ArrowRight') {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        // Check if caret is at the end of the token's text
        const textLength = (event.target as HTMLElement).textContent?.length ?? 0;
        if (range.startOffset === textLength && range.collapsed) {
          // Move to next token if exists
          if (index < this.tokens.length - 1) {
            event.preventDefault();
            this.focusToken(index + 1, /* placeCursorAtEnd= */ false);
          }
        }
      }
    }

    // If user presses Backspace on an empty token, remove that token
    if (event.key === 'Backspace') {
      const text = (event.target as HTMLElement).textContent ?? '';
      if (!text) {
        event.preventDefault();
        this.tokens.splice(index, 1);
        this.emitChange();
        // Focus the previous token or the input if none remain
        if (index > 0) {
          this.focusToken(index - 1, true);
        } else if (this.tokens.length === 0) {
          setTimeout(() => {
            this.filterInput?.nativeElement.focus();
          });
        }
      }
    }
  }

  /**
   * Focus a given token's contenteditable span programmatically
   */
  private focusToken(index: number, placeCursorAtEnd: boolean) {
    const tokenElements = document.querySelectorAll('.tokens-display .token[contenteditable="true"]');
    const el = tokenElements[index] as HTMLElement | undefined;
    if (!el) return;

    el.focus();
    
    // Optionally place caret at end or start
    if (placeCursorAtEnd) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false); // end
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(true); // start
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  /**
   * (Optional) Handle when a token is focused
   */
  onTokenFocus(token: FilterToken, index: number) {
    // You could highlight or store the active index here
  }

  /**
   * (Optional) Handle when a token is blurred
   */
  onTokenBlur(event: FocusEvent, token: FilterToken, index: number) {
    // If the user changed this token's text content, update token.value
    const newText = (event.target as HTMLElement).textContent || '';
    if (newText !== token.value) {
      token.value = newText;
      token.displayValue = newText;
      this.emitChange();
    }
  }

  public isSingleSelectSearchMode = false;
} 