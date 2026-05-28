import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Success } from './pages/success/success';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'criar-conta', component: Signup },
  { path: 'sucesso', component: Success },
  { path: '**', redirectTo: '' },
];
