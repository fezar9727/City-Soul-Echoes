import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-recuperar-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  formulario: FormGroup;
  cargando = false;
  enviado = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacion: NotificacionService
  ) {
    this.formulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.authService.recuperarPassword(this.formulario.value.correo).subscribe({
      next: () => {
        this.cargando = false;
        this.enviado = true;
      },
      error: () => {
        this.cargando = false;
        // Mismo mensaje aunque falle, para no revelar si el correo existe o no
        // (práctica de seguridad estándar, evita enumeración de usuarios)
        this.enviado = true;
      }
    });
  }
}