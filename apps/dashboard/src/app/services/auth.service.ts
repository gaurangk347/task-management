import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginDto, AuthResponse, UserWithRole } from '@task-management/data';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  // Store current user with role provided by backend
  private currentUserSubject = new BehaviorSubject<UserWithRole | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);

  // Trigger initialization without relying on constructor parameter injection
  private readonly _initialized = this.initializeFromStorage();

  private initializeFromStorage(): boolean {
    // Check for existing token on init
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user) as UserWithRole;
        this.currentUserSubject.next(parsedUser);
      } catch {
        // Fallback: clear corrupted storage
        localStorage.removeItem('currentUser');
      }
    }
    return true;
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): UserWithRole | null {
    return this.currentUserSubject.value;
  }
}
