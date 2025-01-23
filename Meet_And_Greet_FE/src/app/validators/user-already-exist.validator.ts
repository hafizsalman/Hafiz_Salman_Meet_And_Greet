import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';

export function userExistsValidator(authService: AuthService): ValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(300),  
      switchMap(email => authService.checkUserExists(email)),
      map(exists => exists ? { emailExists: true } : null),
      catchError(() => of(null)) 
    );
  };
}
