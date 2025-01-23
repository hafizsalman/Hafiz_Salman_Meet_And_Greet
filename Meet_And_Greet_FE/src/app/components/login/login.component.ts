import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, isPlatformServer } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  protected loginForm!: FormGroup;
  protected errorMessage: string | null = null;
  protected isPasswordVisible: boolean = false;
  protected isLoading: boolean = false;
  protected isServer: boolean = false;
  protected notificationMessage: string | null = null;
  protected isShowAlert: boolean = false;

  constructor(
    private authService: AuthService, private router: Router,
    private fb: FormBuilder, @Inject(PLATFORM_ID) platformId: Object,
    private notificationService: NotificationService
  ) {
    this.isServer = isPlatformServer(platformId);
    this.createForm();
  }

  ngOnInit(): void {
    const notification = this.notificationService.getNotification();
    if (notification) {
      this.notificationMessage = notification;
      this.isShowAlert = true;
      setTimeout(() => {
        this.isShowAlert = false;
      }, 8000);
    }
  }

  protected get formControls(): FormGroup['controls'] {
    return this.loginForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  protected login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.formControls['email'].value, this.formControls['password'].value).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.router.navigate(['home']);
        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  protected navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  protected dismissAlert(): void {
    this.isShowAlert = false;
  }

  private createForm(): void {
    if (!this.isServer) {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
      });
    }
  }
}
