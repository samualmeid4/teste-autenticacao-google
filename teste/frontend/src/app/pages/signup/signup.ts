import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  message = '';
  messageType: 'success' | 'error' = 'success';
  isLoading = false;

  readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirm: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      this.message = 'Preencha todos os campos corretamente.';
      this.messageType = 'error';
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    if (payload.password !== payload.password_confirm) {
      this.message = 'As senhas nao conferem.';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authService
      .register({
        username: payload.username ?? '',
        email: payload.email ?? '',
        password: payload.password ?? '',
        password_confirm: payload.password_confirm ?? '',
      })
      .subscribe({
        next: () => {
          this.message = 'Conta criada com sucesso.';
          this.messageType = 'success';
          this.isLoading = false;
          this.router.navigate(['/'], { queryParams: { contaCriada: '1' } });
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
    if (!response) {
      return 'Nao foi possivel criar a conta. Verifique os dados.';
    }

    if (typeof response === 'string') {
      return response;
    }

    const firstValue = Object.values(response)[0];
    if (Array.isArray(firstValue)) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }

    if (response.detail) {
      return String(response.detail);
    }

    return 'Nao foi possivel criar a conta. Verifique os dados.';
  }
}
