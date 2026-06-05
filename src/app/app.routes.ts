import { Routes } from '@angular/router';
import { Welcome } from './components/welcome/welcome';
import { RoleSelection } from './components/role-selection/role-selection';
import { RegisterForm } from './components/register-form/register-form';
import { Login } from './components/login/login';
import { MainLayout } from './components/main-layout/main-layout';
import { Inicio } from './components/inicio/inicio';
import { MisFlashcards } from './components/mis-flashcards/mis-flashcards';
import { Creacion } from './components/creacion/creacion';
import { AcercaDe } from './components/acerca-de/acerca-de';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'welcome', component: Welcome },
  { path: 'role', component: RoleSelection },
  { path: 'register', component: RegisterForm },
  { path: 'login', component: Login },
  { 
    path: '', 
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'mis-flashcards', component: MisFlashcards },
      { path: 'creacion', component: Creacion },
      { path: 'acerca-de', component: AcercaDe }
    ]
  },
  { path: '**', redirectTo: 'welcome' }
];
