import { AbstractControl, AsyncValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';
import { Observable, of, combineLatest } from 'rxjs';
import { debounceTime, switchMap, map, catchError, startWith } from 'rxjs/operators';
import { RoomService } from '../services/room.service';
export function uniqueRoomNameAndLocationValidator(roomService: RoomService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return of(null);

    const nameControl = formGroup.get('name');
    const locationControl = formGroup.get('location');
    const idControl = formGroup.get('id');

    if (!nameControl || !locationControl) return of(null);

    const areControlsValidLength = (control: AbstractControl) =>
      control.value && control.value.length >= 3;

    if (!areControlsValidLength(nameControl) || !areControlsValidLength(locationControl)) {
      clearUniqueError(nameControl);
      clearUniqueError(locationControl);
      return of(null);
    }

    return combineLatest([
      nameControl.valueChanges.pipe(startWith(nameControl.value)),
      locationControl.valueChanges.pipe(startWith(locationControl.value))
    ]).pipe(
      debounceTime(300),
      switchMap(([name, location]) =>
        roomService.checkRoomUnique(name.trim(), location.trim(), idControl?.value).pipe(
          map(isUnique => {
            if (isUnique) {
              clearUniqueError(nameControl);
              clearUniqueError(locationControl);
            } else {
              setUniqueError(nameControl);
              setUniqueError(locationControl);
            }
            return null;
          }),
          catchError(err => {
            console.error('Error in validation', err);
            return of(null);
          })
        )
      )
    );
  };
}

function clearUniqueError(control: AbstractControl): void {
  if (control.errors) {
    const { roomNameAndLocationAlreadyTaken, ...otherErrors } = control.errors;
    control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
  }
}

function setUniqueError(control: AbstractControl): void {
  control.setErrors({
    ...(control.errors || {}),
    roomNameAndLocationAlreadyTaken: true
  });
}
