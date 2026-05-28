import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    perfil: string;
  };
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  username: string;
  password_confirm: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, payload).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  googleLogin(credential: string) {
  return this.http.post<AuthResponse>(`${this.apiUrl}/google/`, { credential }).pipe(
    tap((response) => this.saveSession(response)),
  );
}

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, payload).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  private saveSession(response: AuthResponse) {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }
}


