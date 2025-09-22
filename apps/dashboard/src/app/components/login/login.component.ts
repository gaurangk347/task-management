import { Component } from '@angular/core';
import { LoginDto } from '@task-management/data';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  credentials: LoginDto = {
    email: '',
    password: '',
  };
  loading = false;
  error = '';
  private authService = inject(AuthService);
  private router = inject(Router);
  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Login failed';
      },
    });
  }
}
