import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterConfig, FilterToken, FilterSuggestion, FilterOperand, FilterOperator } from '../../models/sql-filter.model';
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
  @Output() filterChange = new EventEmitter<string>();

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

  private inputSubject = new Subject<string>();
  private subscription: Subscription | null = null;

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
      return 'Type to search for a column...';
    } else if (!this.currentOperator) {
      return `Select an operator for "${this.currentOperand.label}"...`;
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
    this.inputValue = input;
    this.showSuggestions = true;
    this.selectedSuggestionIndex = -1;
    this.inputSubject.next(input);
  }

  onFocus() {
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
      if (this.currentOperand?.type === 'autocomplete') {
        this.isAutocompleteMode = true;
        this.isMultiSelectMode = false;
      } else {
        this.isMultiSelectMode = true;
        this.isAutocompleteMode = false;
      }
      this.selectedValues = [];
      this.tokens.push({
        type: suggestion.type,
        value: suggestion.value,
        displayValue: suggestion.displayValue,
        operandType: suggestion.operandType
      });
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

    this.isMultiSelectMode = false;
    this.isAutocompleteMode = false;
    this.selectedValues = [];
    this.currentOperand = null;
    this.currentOperator = null;
    this.showSuggestions = false;
    this.inputValue = '';
    this.emitChange();
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
      this.tokens.pop();
      this.resetCurrentState();
      this.emitChange();
      this.updateSuggestionsForInput(this.inputValue);
    }
  }

  private resetCurrentState() {
    let operand = null;
    let operator = null;
    
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (token.type === 'operand') {
        operand = this.config.operands.find(op => op.name === token.value) || null;
        break;
      } else if (token.type === 'operator') {
        operator = this.config.operators.find(op => op.symbol === token.value) || null;
      }
    }

    this.currentOperand = operand;
    this.currentOperator = operator;
    this.isMultiSelectMode = false;
    this.isAutocompleteMode = false;
    this.selectedValues = [];
  }

  private updateSuggestionsForInput(input: string) {
    this.suggestions = [];
    const lowercaseInput = input.toLowerCase();

    if (!this.currentOperand && !this.currentOperator) {
      // Show operands that match the input
      this.suggestions = this.config.operands
        .filter(op => op.label.toLowerCase().includes(lowercaseInput))
        .map(op => ({
          type: 'operand' as const,
          value: op.name,
          label: op.label,
          displayValue: op.label,
          operandType: op.type
        }));

      // Add logical operators if we have tokens
      if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type !== 'operator') {
        this.suggestions.push(
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
    } else if (this.currentOperand && this.currentOperator) {
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

  private emitChange() {
    if (this.tokens.length === 0) {
      this.filterChange.emit('');
      return;
    }

    let sql = '';
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

    this.filterChange.emit(sql);
  }
} 