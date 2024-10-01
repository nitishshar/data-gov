export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'rich-text';

  export interface FormConfig {
    formTitle: string;
    formGroups: FormGroupConfig[];
  }
  
  export interface FormGroupConfig {
    groupName: string;
    fields: FormField[];
  }
  
  export interface FormField {
    type: FormFieldType;
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    value?: any;
    options?: string[];
    description?: string;
    owner?: string;
    validations?: ValidationRule[];
  }

export interface ValidationRule {
  name: string; // The name of the validation rule (e.g., 'required', 'minLength')
  validator: ValidatorType; // The type of validator
  value?: any; // The value for validation (e.g., minLength: 3)
  message: string; // The error message to display
}

export type ValidatorType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'requiredTrue'
  | 'pattern';
