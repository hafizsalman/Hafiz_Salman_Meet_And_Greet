import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Booking } from '../models/booking.model';

export function timeSlotBookedValidator(bookings: Booking []): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const formGroup = control.parent;
    const startDate = formGroup?.get('startDate')?.value;
    const selectedTime = formGroup?.get('startTime')?.value;

    if (startDate && selectedTime) {
      const selectedDateTime = new Date(`${startDate}T${selectedTime}:00`);

      for (const booking of bookings) {
        const bookedStart = new Date(booking.startTime);
        const bookedEnd = new Date(booking.endTime);

        if (selectedDateTime >= bookedStart && selectedDateTime < bookedEnd) {
          return { timeBooked: true }; 
        }
      }
    }

    return null;  
  };
}
