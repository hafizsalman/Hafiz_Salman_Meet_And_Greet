import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    let strength = 0;

    if (value.length == 0) {
      return null;
    }

    let errors: ValidationErrors = {};

    if (value.length < 8) {
      errors['shortLength'] = true;
    }
    if (!/\d/.test(value)) {
      errors['missingNumber'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['missingSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
