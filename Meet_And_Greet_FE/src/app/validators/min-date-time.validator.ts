import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            return null;
        }
        const inputDate = new Date(control.value);
        inputDate.setHours(0, 0, 0, 0);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (inputDate < currentDate) {
            return { minDate: true };
        }
        return null;
    };
}

export function minTimeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            return null;
        }
        const startDateControl = control.parent?.get('startDate');

        if(new Date(startDateControl?.value) > new Date()){
            return null;
        }

        const inputTime = new Date();
        const [hours, minutes] = control.value.split(':').map(Number);
        inputTime.setHours(hours, minutes, 0, 0);

        const currentTime = new Date();
        const minTime = new Date(currentTime.getTime());

        if (inputTime < minTime) {
            return { minTime: true };
        }
        return null;
    };
}
