import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-resetear-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './resetear-password.component.html',
  styleUrl: './resetear-password.component.css'
})
export class ResetearPasswordComponent implements OnInit {
  formulario: FormGroup;
  cargando = false;
  token: string | null = null;
  tokenFaltante = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificacion: NotificacionService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.tokenFaltante = true;
    }
  }

  onSubmit(): void {
    if (this.formulario.invalid || !this.token) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { nuevaPassword, confirmarPassword } = this.formulario.value;
    if (nuevaPassword !== confirmarPassword) {
      this.notificacion.error('Las contraseñas no coinciden', 'Verificá que ambos campos sean iguales.');
      return;
    }
    this.cargando = true;
    this.authService.resetearPassword(this.token, nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.notificacion.exito('Contraseña actualizada', 'Ya podés iniciar sesión con tu nueva contraseña.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.cargando = false;
        const mensaje = error.error?.mensaje || 'El enlace expiró o no es válido. Pedí uno nuevo.';
        this.notificacion.error('No se pudo actualizar', mensaje);
      }
    });
  }
}