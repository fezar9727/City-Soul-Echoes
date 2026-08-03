import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminObrasComponent } from './pages/admin-obras/admin-obras.component';
import { AdminEventosComponent } from './pages/admin-eventos/admin-eventos.component';
import { AdminCursosComponent } from './pages/admin-cursos/admin-cursos.component';
import { PerfilPublicoComponent } from './pages/perfil-publico/perfil-publico.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/obras', component: AdminObrasComponent, canActivate: [adminGuard] },
  { path: 'admin/eventos', component: AdminEventosComponent, canActivate: [adminGuard] },
  { path: 'admin/cursos', component: AdminCursosComponent, canActivate: [adminGuard] },
  { path: 'perfil/:id', component: PerfilPublicoComponent },
  { path: '**', redirectTo: '' }
];