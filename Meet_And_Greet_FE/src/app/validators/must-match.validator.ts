import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormGroup } from '@angular/forms';

export function mustMatch(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;

    const passwordControl = formGroup.get('password');
    const matchingControl = formGroup.get('confirmPassword');

    if (!passwordControl || !matchingControl || !passwordControl.value || !matchingControl.value) return null;

    return passwordControl.value === matchingControl.value ? null : { mustMatch: true };

  };
}