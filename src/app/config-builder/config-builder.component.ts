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
  ],
  templateUrl: './config-builder.component.html',
  styleUrls: ['./config-builder.component.scss'],
})
export class ConfigBuilderComponent {
  configForm: WritableSignal<FormGroup>;

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
  validatorTypes: { label: string; value: string }[] = [
    { label: 'Required', value: 'required' },
    { label: 'Min Length', value: 'minLength' },
    { label: 'Max Length', value: 'maxLength' },
    { label: 'Pattern', value: 'pattern' },
    { label: 'Required True', value: 'requiredTrue' },
  ];

  constructor(private fb: FormBuilder) {
    this.configForm = signal(
      this.fb.group({
        formTitle: ['', Validators.required],
        formGroups: this.fb.array([]), // Initialize with an empty FormArray
      })
    );
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
    this.getOptionsControls(groupIndex, fieldIndex).push(this.fb.control(''));
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
}
