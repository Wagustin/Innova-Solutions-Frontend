import { Routes } from '@angular/router';
import { Welcome } from './components/welcome/welcome';
import { RoleSelection } from './components/role-selection/role-selection';
import { RegisterForm } from './components/register-form/register-form';
import { Login } from './components/login/login';
import { MainLayout } from './components/main-layout/main-layout';
import { Inicio } from './components/inicio/inicio';
import { MisFlashcards } from './components/mis-flashcards/mis-flashcards';
import { ResponderFlashcard } from './components/responder-flashcard/responder-flashcard';
import { Creacion } from './components/creacion/creacion';
import { AcercaDe } from './components/acerca-de/acerca-de';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { AuthGuard } from './guards/auth.guard';
import { PadreDashboard } from './components/padre-dashboard/padre-dashboard';
import { RegistroAlumno } from './components/registro-alumno/registro-alumno';
import { MisAlumnosComponent } from './components/mis-alumnos/mis-alumnos';

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
      { path: 'responder/:id', component: ResponderFlashcard },
      { path: 'creacion', component: Creacion },
      { path: 'acerca-de', component: AcercaDe },
      { path: 'mi-perfil', component: MiPerfil },
      { path: 'padre/dashboard', component: PadreDashboard },
      { path: 'padre/registrar-alumno', component: RegistroAlumno },
      { path: 'mis-alumnos', component: MisAlumnosComponent }
    ]
  },
  { path: '**', redirectTo: 'welcome' }
];
