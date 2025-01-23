import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { userExistsValidator } from '../../validators/user-already-exist.validator';
import { User } from '../../models/user.model';
import { noWhitespaceValidator } from '../../validators/white-space.validator';
import { mustMatch } from '../../validators/must-match.validator';
import { passwordStrengthValidator } from '../../validators/password-strength.validator';
import { EventEmitter } from '@angular/core';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {

  @Output() public isSuccessfullySignedUp: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected signupForm!: FormGroup;
  protected errorMessage: boolean = false;
  protected successMessage: boolean = false;
  protected isLoading: boolean = false;
  protected isPasswordVisible: boolean = false;
  protected isConfirmPasswordVisible: boolean = false;
  protected passwordStrength: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  public ngOnInit(): void {
    this.createForm();
  }
  protected getPasswordStrengthPercentage(): number {
    const value: string = this.formControls['password'].value || '';
    let strength = 0;

    if (/[A-Z]/.test(value)) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[@$!%*?&]/.test(value)) strength++
    else if(strength>3) strength--;;

    return (strength / 5) * 100;
}

protected getStrengthColor(): boolean {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 60) {
      return true;
    }
    return false;
}
protected getPasswordStrengthClass(): string {
    const percentage = this.getPasswordStrengthPercentage();
    console.log(percentage);
    if (percentage <= 80) {
        return 'bg-danger';
    }  else {
        return 'bg-success';
    }
}

getPasswordErrorMessage(): string {
  const errors = this.formControls['password'].errors;
  if (!errors) return '';

  let messages = [];
  if (errors['required']) return 'Password is required';
  if (errors['shortLength']) messages.push('be at least 8 characters long');
  if (errors['missingNumber'] && errors['missingSpecialChar']) {
    messages.push('have a number and special character');
  } else {
    if (errors['missingNumber']) messages.push('include a number');
    if (errors['missingSpecialChar']) messages.push('include a special character');
  }

  return `Must ${messages.join(', ')}.`;
}

protected getPasswordStrengthText(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage <= 80) {
        return 'Weak';
    }  else {
        return 'Strong';
    }
}

passwordMeetsCriteria(criteria: string): boolean {
  const password = this.formControls['password'].value;
  switch(criteria) {
    case 'length': return password.length >= 8;
    case 'uppercase-and-lowercase': return /[A-Z]/.test(password) || /[a-z]/.test(password);
    case 'number-and-special': return /\d/.test(password) || /[@$!%*?&]/.test(password);
    default: return false;
  }
}
  protected get formControls(): FormGroup['controls'] {
    return this.signupForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  protected register(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { firstName, lastName, email, password } = this.signupForm.value;
    const user: User = { firstName, lastName, email, password };

    this.authService.register(user).subscribe({
      next: () => {
        this.notificationService.setNotification('Account has been created. Please login');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.errorMessage = true;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private createForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), noWhitespaceValidator],],
      lastName: ['', [noWhitespaceValidator],],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [userExistsValidator(this.authService)],
        updateOn: 'blur'
      }],
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator],],
      confirmPassword: ['', [Validators.required, mustMatch()],]
    });
    this.signupForm.get('password')?.valueChanges.subscribe((password: string) => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });

  }

}
