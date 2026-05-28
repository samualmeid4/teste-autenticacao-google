import { Component, NgZone, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  message = '';
  messageType: 'success' | 'error' = 'success';
  isLoading = false;

  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngAfterViewInit() {
    this.renderGoogleButton();
  }

  handleGoogleLogin(response: { credential: string }) {
    this.zone.run(() => {
      this.message = '';
      this.isLoading = true;
    });

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.zone.run(() => {
          this.isLoading = false;
          this.router.navigate(['/sucesso']);
        });
      },
      error: (error: HttpErrorResponse) => {
        this.zone.run(() => {
          this.message = this.getGoogleErrorMessage(error);
          this.messageType = 'error';
          this.isLoading = false;
        });
      },
    });
  }

  private renderGoogleButton() {
    const googleButton = document.getElementById('google-button');
    if (!googleButton) {
      return;
    }

    if (typeof google === 'undefined') {
      this.message = 'Script do Google ainda nao carregou. Atualize a pagina e tente novamente.';
      this.messageType = 'error';
      return;
    }

    google.accounts.id.initialize({
      client_id: '468835661536-40fsecelhc8adt9ipi9710bv5kegi80p.apps.googleusercontent.com',
      callback: (response: { credential: string }) => this.handleGoogleLogin(response),
    });

    google.accounts.id.renderButton(googleButton, {
      theme: 'outline',
      size: 'large',
      width: 340,
    });
  }

  constructor() {
    if (this.route.snapshot.queryParamMap.get('contaCriada') === '1') {
      this.message = 'Conta criada com sucesso. Agora faca login.';
      this.messageType = 'success';
    }
  }

  submit() {
    if (this.form.invalid) {
      this.message = 'Preencha e-mail e senha corretamente.';
      this.messageType = 'error';
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = '';

    const { email, password } = this.form.getRawValue();
    this.authService.login({ email: email ?? '', password: password ?? '' }).subscribe({
      next: () => {
        this.message = 'Login realizado com sucesso.';
        this.messageType = 'success';
        this.isLoading = false;
        this.router.navigate(['/sucesso']);
      },
      error: (error: HttpErrorResponse) => {
        this.message = this.getErrorMessage(error);
        this.messageType = 'error';
        this.isLoading = false;
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse) {
    if (error.status === 0) {
      return 'Nao foi possivel conectar ao backend. Verifique se o Django esta rodando na porta 8000.';
    }

    const response = error.error;
    if (response?.non_field_errors?.length) {
      return String(response.non_field_errors[0]);
    }

    if (response?.detail) {
      return String(response.detail);
    }

    return 'Nao foi possivel entrar. Verifique seus dados.';
  }

  private getGoogleErrorMessage(error: HttpErrorResponse) {
    if (error.status === 0) {
      return 'Nao foi possivel conectar ao backend. Verifique se o Django esta rodando na porta 8000.';
    }

    if (error.error?.detail) {
      return String(error.error.detail);
    }

    return 'Nao foi possivel entrar com Google.';
  }
}

declare const google: any;
