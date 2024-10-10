import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
  FormConfig,
  FormField,
  FormGroupConfig,
  ValidationRule,
} from '../models/form-config.model';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
  selector: 'app-form-builder',
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
    FlexLayoutModule,
    MatExpansionModule,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  // Use Angular Signals for form config and form state
  formConfig: WritableSignal<FormConfig | null> = signal(null);
  form: WritableSignal<FormGroup>;

  // State for edit mode
  isEditMode: boolean = false;
  originalValues: FormConfig | null = null;
  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = signal(
      this.fb.group({
        groups: this.fb.array([]), // Initialize with an empty form array for groups
      })
    );
  }

  ngOnInit() {
    // Load JSON configuration from assets

    // Initialize with a blank form or load a default configuration
    this.loadFormConfiguration();
  }

  // Load existing form values for editing
  public loadFormConfiguration(existingConfig?: FormConfig) {
    if (existingConfig) {
      this.formConfig.set(existingConfig);
      this.buildFormGroups(existingConfig.formGroups);
      this.isEditMode = true;
      this.originalValues = existingConfig; // Save the original values
    } else {
      // const initialConfig: FormConfig = {
      //   formTitle: 'New Dynamic Form',
      //   formGroups: []
      // };
      // this.formConfig.set(initialConfig);
      // this.buildFormGroups(initialConfig.formGroups);
      this.http
        .get<FormConfig>('/assets/form-config.json')
        .subscribe((config) => {
          this.formConfig.set(config);
          this.buildFormGroups(config.formGroups);
        });
    }
  }

  // Method to build form groups based on the configuration
  buildFormGroups(groups: FormGroupConfig[]) {
    const formGroupsArray = this.fb.array([]); // Create a new form array

    groups.forEach((group) => {
      const groupForm = this.fb.group({}); // Create a form group for each config group
      group.fields.forEach((field) => {
        const control = this.fb.control(
          field.value || '',
          this.applyValidations(field.validations)
        );
        groupForm.addControl(field.name, control);
      });
      formGroupsArray.push(groupForm as any); // Add the form group to the form array
    });

    this.form().setControl('groups', formGroupsArray); // Set the form array to 'groups'
  }

  // Method to apply custom validations
  applyValidations(validations?: ValidationRule[]): ValidatorFn[] {
    const validatorFns: ValidatorFn[] = [];

    if (validations) {
      validations.forEach((validation) => {
        switch (validation.validator) {
          case 'required':
            validatorFns.push(Validators.required);
            break;
          case 'minLength':
            validatorFns.push(Validators.minLength(validation.value));
            break;
          case 'maxLength':
            validatorFns.push(Validators.maxLength(validation.value));
            break;
          case 'requiredTrue':
            validatorFns.push(Validators.requiredTrue);
            break;
          case 'pattern':
            validatorFns.push(Validators.pattern(validation.value));
            break;
          default:
            break;
        }
      });
    }

    return validatorFns;
  }

  // Method to handle form submission
  onSubmit() {
    if (this.form().valid) {
      console.log('Form Submitted', this.form().value);
    } else {
      console.log('Form is invalid');
    }
  }

  // Cancel editing and revert changes
  cancelEdit() {
    if (this.originalValues) {
      this.loadFormConfiguration(this.originalValues);
    }
    this.isEditMode = false;
  }

  // Helper to access form groups in the template
  get formGroupsArray(): FormArray {
    return this.form().get('groups') as FormArray;
  }

  // Helper to access individual group controls
  public getGroupControls(index: number): FormGroup | null {
    const group = this.formGroupsArray.at(index) as FormGroup;
    return group ? group : null;
  }

  removeFormGroup(index: number, event: Event) {
    event.stopPropagation();
    const formGroups = this.form().get('groups') as FormArray;

    if (formGroups && formGroups.length > index) {
      formGroups.removeAt(index);
    }
  }

  removeFieldFromGroup(groupIndex: number, fieldName: string) {
    const group = this.getGroupControls(groupIndex);
    group!.removeControl(fieldName);
  }

  // Method to get error message for a specific field
  getErrorMessage(fieldName: string, groupIndex: number): string | null {
    const group = this.getGroupControls(groupIndex);
    const field = group!.get(fieldName);

    if (field && this.formConfig()) {
      const groupConfig = this.formConfig()?.formGroups[groupIndex];
      const fieldConfig = groupConfig!.fields.find((f) => f.name === fieldName);

      if (fieldConfig && fieldConfig.validations) {
        for (const validation of fieldConfig.validations) {
          if (field.hasError(validation.name)) {
            return validation.message;
          }
        }
      }
    }
    return null;
  }
}
