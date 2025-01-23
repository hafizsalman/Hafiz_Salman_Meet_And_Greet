import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';
import { User } from '../models/user.model';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.baseUrl}/auth`;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private cookieService: CookieService
  ) {}

  public login(email: string, password: string): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { responseType: 'text' })
      .pipe(
        tap(response => {
          this.setCookie('username', response, 1);
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }

  public register(user: User): Observable<boolean> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));

    return this.http.post<User>(`${this.apiUrl}/signup`, formData )
      .pipe(
        map(user => !!user),
        catchError(() => of(false))
      );
  }

  public checkUserExists(email: string): Observable<boolean> {
    return this.http.get<boolean> (`${this.apiUrl}/user-exists`, { params: { email } }).pipe(
      map(response => response as boolean),
      catchError(() => of(false))
    );
  }

  public logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe(() => {
      this.deleteCookies();
    });
  }

  public checkAuthStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/status`, { responseType: 'json' }).pipe(
      catchError(() => {
        return of(false);
      })
    );
  }

  public getUsername(): string {
    return this.getCookie('username') || '';
  }

  private deleteCookies(): void {
    this.cookieService.delete('name', '/', undefined, true, 'Strict');
    this.router.navigate(['login']);
  }

  private setCookie(name: string, value: string, days: number): void {
    this.cookieService.set(name, value, days, '/', undefined, true, 'Strict');
  }

  private getCookie(name: string): string | null {
    return this.cookieService.get(name) || null;
  }
}
