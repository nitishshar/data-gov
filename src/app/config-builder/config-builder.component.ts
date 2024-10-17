import { Component, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormConfig, ValidatorType } from '../models/form-config.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-config-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './config-builder.component.html',
  styleUrls: ['./config-builder.component.scss'],
})
export class ConfigBuilderComponent {
  configForm: WritableSignal<FormGroup>;

  // Add this property
  users: string[] = ['User1', 'User2', 'User3']; // Mock user list

  // Supported field types
  fieldTypes: string[] = [
    'text',
    'textarea',
    'dropdown',
    'multi-select',
    'radio',
    'checkbox',
    'rich-text',
  ];
  // Supported validation types
  validatorTypes: { label: string; value: ValidatorType }[] = [
    { label: 'Required', value: 'required' },
    { label: 'Min Length', value: 'minLength' },
    { label: 'Max Length', value: 'maxLength' },
    { label: 'Pattern', value: 'pattern' },
    { label: 'Required True', value: 'requiredTrue' },
  ];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.configForm = signal(
      this.fb.group({
        formTitle: ['', Validators.required],
        formGroups: this.fb.array([]),
      })
    );
    this.addFormGroup(); // Initialize with one form group
  }

  ngOnInit() {
    // Initialize with one form group for demonstration
    this.addFormGroup();
  }

  // Get form groups array
  get formGroups(): FormArray {
    return this.configForm().get('formGroups') as FormArray;
  }

  // Add a new form group
  addFormGroup() {
    const group = this.fb.group({
      groupName: ['', Validators.required],
      owner: ['', Validators.required],
      enabled: [true], // Add this line to include the 'enabled' control
      fields: this.fb.array([]),
    });
    this.formGroups.push(group);
  }

  // Remove a form group
  removeFormGroup(index: number) {
    this.formGroups.removeAt(index);
  }

  // Get field controls for a form group
  getFieldControls(groupIndex: number): FormArray {
    return this.formGroups.at(groupIndex).get('fields') as FormArray;
  }

  // Add a new field to a form group
  addField(groupIndex: number) {
    const fieldGroup = this.fb.group({
      type: ['', Validators.required],
      label: ['', Validators.required],
      name: ['', Validators.required],
      placeholder: [''],
      required: [false],
      description: [''],
      owner: [''],
      options: this.fb.array([]),
      validations: this.fb.array([]),
    });
    this.getFieldControls(groupIndex).push(fieldGroup);
  }

  // Remove a field from a form group
  removeField(groupIndex: number, fieldIndex: number) {
    this.getFieldControls(groupIndex).removeAt(fieldIndex);
  }

  // Get options form array for a field
  getOptionsControls(groupIndex: number, fieldIndex: number): FormArray {
    return this.getFieldControls(groupIndex)
      .at(fieldIndex)
      .get('options') as FormArray;
  }

  // Add an option to a field
  addOption(groupIndex: number, fieldIndex: number) {
    const optionGroup = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.getOptionsControls(groupIndex, fieldIndex).push(optionGroup);
  }

  addOptions(groupIndex: number, fieldIndex: number, optionsString: string) {
    const options = optionsString.split(',').map(option => option.trim());
    options.forEach(option => {
      let label, value;
      if (option.includes(':')) {
        [label, value] = option.split(':').map(part => part.trim());
      } else {
        label = value = option;
      }
      
      const optionGroup = this.fb.group({
        label: [label, Validators.required],
        value: [value, Validators.required]
      });
      this.getOptionsControls(groupIndex, fieldIndex).push(optionGroup);
    });
  }

  // Remove an option from a field
  removeOption(groupIndex: number, fieldIndex: number, optionIndex: number) {
    this.getOptionsControls(groupIndex, fieldIndex).removeAt(optionIndex);
  }

  // Get validations form array for a field
  getValidationsControls(groupIndex: number, fieldIndex: number): FormArray {
    return this.getFieldControls(groupIndex)
      .at(fieldIndex)
      .get('validations') as FormArray;
  }

  // Add a validation to a field
  addValidation(groupIndex: number, fieldIndex: number) {
    const validationGroup = this.fb.group({
      validator: ['', Validators.required],
      value: [''],
      message: ['', Validators.required],
    });
    this.getValidationsControls(groupIndex, fieldIndex).push(validationGroup);
  }

  // Remove a validation from a field
  removeValidation(
    groupIndex: number,
    fieldIndex: number,
    validationIndex: number
  ) {
    this.getValidationsControls(groupIndex, fieldIndex).removeAt(
      validationIndex
    );
  }

  // Generate JSON configuration from the form
  generateJsonConfig() {
    if (this.configForm().valid) {
      const formConfig: FormConfig = this.configForm().value;
      console.log(JSON.stringify(formConfig, null, 2));
    } else {
      console.log('The configuration form is invalid.');
    }
  }

  // Add these methods to your ConfigBuilderComponent class
  canEditGroup(groupIndex: number): boolean {
    // Implement your logic here. For now, we'll return true
    return true;
  }

  canEditField(groupIndex: number, fieldIndex: number): boolean {
    // Implement your logic here. For now, we'll return true
    return true;
  }

  // Add this method to your ConfigBuilderComponent class
  openJsonPreview() {
    console.log(JSON.stringify(this.configForm().value, null, 2));
    // Implement your logic to open a dialog or display the JSON
  }

  // Add this method to your ConfigBuilderComponent class
  toggleGroupEnabled(groupIndex: number): void {
    const group = this.formGroups.at(groupIndex);
    const currentValue = group.get('enabled')?.value;
    group.get('enabled')?.setValue(!currentValue);
  }

  getFieldIcon(fieldType: string): string {
    const iconMap: { [key: string]: string } = {
      'text': 'short_text',
      'textarea': 'notes',
      'dropdown': 'arrow_drop_down_circle',
      'multi-select': 'check_box',
      'radio': 'radio_button_checked',
      'checkbox': 'check_box',
      'rich-text': 'format_shapes'
    };
    return iconMap[fieldType] || 'input';
  }
}
