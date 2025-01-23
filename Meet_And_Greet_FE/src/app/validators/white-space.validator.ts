import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value)
        return null;
    const trimmedValue = value.trim();
    const hasLeadingOrTrailingWhitespace = value.length !== trimmedValue.length;
    if (hasLeadingOrTrailingWhitespace && trimmedValue.length < 3) {
        return { whitespace: true };
    }
    return null;
}
