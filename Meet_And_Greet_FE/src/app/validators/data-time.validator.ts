import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validateEndDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDateControl = control.parent?.get('startDate');
    const endDate = control.value;

    if (startDateControl) {
      const startDate = startDateControl.value;

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return { invalidEndDate: true };
      }
    }

    return null; 
  };
}

export function validateEndTime(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDateControl = control.parent?.get('startDate');
    const startTimeControl = control.parent?.get('startTime');
    const endDateControl = control.parent?.get('endDate');
    const endTime = control.value;

    if (startDateControl && startTimeControl && endDateControl) {
      const startDate = startDateControl.value;
      const startTime = startTimeControl.value;
      const endDate = endDateControl.value;

      if (startDate && endDate && startTime && endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);

        if (endDateTime <= startDateTime) {
          return { invalidEndTime: true };
        }
      }
    }

    return null; 
  };
}
