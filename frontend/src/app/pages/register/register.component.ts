import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formulario: FormGroup;
  cargando = false;
  mostrarPassword = false;
  municipiosValleDelCauca: string[] = [
    'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga',
    'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'El Cerrito',
    'Ginebra', 'Guacarí', 'San Pedro', 'Andalucía', 'Bugalagrande',
    'Zarzal', 'La Victoria', 'Roldanillo', 'La Unión', 'Toro', 'Ansermanuevo',
    'Ulloa', 'Alcalá', 'Sevilla', 'Caicedonia', 'Trujillo',
    'Riofrío', 'Restrepo', 'Vijes', 'Dagua', 'La Cumbre', 'Yotoco',
    'Calima (Darién)', 'Argelia', 'El Águila', 'El Cairo', 'Versalles',
    'El Dovio', 'Obando'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacion: NotificacionService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
      ]],
      telefono: ['', [Validators.pattern(/^3\d{9}$/)]],
      ciudad: ['', [Validators.pattern(/^(Cali|Palmira|Buenaventura|Tuluá|Cartago|Buga|Jamundí|Yumbo|Candelaria|Florida|Pradera|El Cerrito|Ginebra|Guacarí|San Pedro|Andalucía|Bugalagrande|Zarzal|La Victoria|Roldanillo|La Unión|Toro|Ansermanuevo|Ulloa|Alcalá|Sevilla|Caicedonia|Trujillo|Riofrío|Restrepo|Vijes|Dagua|La Cumbre|Yotoco|Calima \(Darién\)|Argelia|El Águila|El Cairo|Versalles|El Dovio|Obando)?$/)]]
    });
  }

  get tieneMinLength(): boolean {
    return (this.formulario.get('password')?.value || '').length >= 8;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.formulario.get('password')?.value || '');
  }

  get tieneMinuscula(): boolean {
    return /[a-z]/.test(this.formulario.get('password')?.value || '');
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.formulario.get('password')?.value || '');
  }

  get tieneCaracterEspecial(): boolean {
    return /[^A-Za-z0-9]/.test(this.formulario.get('password')?.value || '');
  }
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.registrarUsuario(this.formulario.value).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.notificacion.exito(`¡Bienvenido, ${respuesta.usuario.nombreCompleto}!`, 'Tu cuenta se creó correctamente.');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.cargando = false;
        const mensaje = error.error?.errors?.[0]?.msg || error.error?.mensaje || 'No pudimos crear tu cuenta.';
        this.notificacion.error('Error al registrarte', mensaje);
      }
    });
  }
}