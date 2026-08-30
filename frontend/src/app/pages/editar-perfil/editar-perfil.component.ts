import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Usuario } from '../../models/usuario.model';
import { SonidoZonaService } from '../../services/sonido-zona.service';
import { ControlSonidoComponent } from '../../components/control-sonido/control-sonido.component';
import { EfectoFondoSutilComponent } from '../../components/efecto-fondo-sutil/efecto-fondo-sutil.component';
@Component({
  selector: 'app-editar-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ControlSonidoComponent, EfectoFondoSutilComponent],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent implements OnInit, OnDestroy {
  formularioDatos: FormGroup;
  formularioPassword: FormGroup;
  cargandoDatos = false;
  cargandoPassword = false;

  usuarioActual: Usuario | null = null;
  archivoAvatar: File | null = null;
  previsualizacionAvatar: string | null = null;
  eliminarAvatarSolicitado = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacion: NotificacionService,
    private sonidoService: SonidoZonaService
  ) {
    this.formularioDatos = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      ciudad: [''],
      bio: ['', [Validators.maxLength(300)]]
    });

    this.formularioPassword = this.fb.group({
      passwordActual: ['', [Validators.required]],
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPasswordNueva: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.sonidoService.reproducirZona('editar-perfil');
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    if (this.usuarioActual) {
      this.formularioDatos.patchValue({
        nombreCompleto: this.usuarioActual.nombreCompleto,
        telefono: this.usuarioActual.telefono || '',
        ciudad: this.usuarioActual.ciudad || '',
        bio: this.usuarioActual.bio || ''
      });
    }
  }

  get inicialesAvatar(): string {
    const nombre = this.usuarioActual?.nombreCompleto || '';
    return nombre.split(' ').slice(0, 2).map((palabra) => palabra[0]?.toUpperCase() || '').join('');
  }

  onArchivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      this.notificacion.error('Imagen muy pesada', 'El límite es 5MB.');
      return;
    }

    this.eliminarAvatarSolicitado = false;
    this.archivoAvatar = archivo;
    const lector = new FileReader();
    lector.onload = () => {
      this.previsualizacionAvatar = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  quitarFoto(): void {
    this.archivoAvatar = null;
    this.previsualizacionAvatar = null;
    this.eliminarAvatarSolicitado = true;
  }

  guardarDatos(): void {
    if (this.formularioDatos.invalid) {
      this.formularioDatos.markAllAsTouched();
      return;
    }
    this.cargandoDatos = true;

    const formData = new FormData();
    const valores = this.formularioDatos.value;
    Object.keys(valores).forEach((clave) => {
      formData.append(clave, valores[clave]);
    });
    if (this.archivoAvatar) {
      formData.append('avatar', this.archivoAvatar);
    }
    if (this.eliminarAvatarSolicitado) {
      formData.append('eliminarAvatar', 'true');
    }

    this.authService.actualizarPerfil(formData).subscribe({
      next: (respuesta) => {
        this.cargandoDatos = false;
        this.usuarioActual = respuesta.usuario;
        this.archivoAvatar = null;
        this.previsualizacionAvatar = null;
        this.eliminarAvatarSolicitado = false;
        this.notificacion.exito('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      },
      error: () => {
        this.cargandoDatos = false;
        this.notificacion.error('No se pudo actualizar', 'Intentá de nuevo.');
      }
    });
  }

  cambiarPassword(): void {
    if (this.formularioPassword.invalid) {
      this.formularioPassword.markAllAsTouched();
      return;
    }
    const { passwordActual, passwordNueva, confirmarPasswordNueva } = this.formularioPassword.value;
    if (passwordNueva !== confirmarPasswordNueva) {
      this.notificacion.error('Las contraseñas no coinciden', 'Verificá que ambos campos sean iguales.');
      return;
    }
    this.cargandoPassword = true;
    this.authService.cambiarPassword(passwordActual, passwordNueva).subscribe({
      next: () => {
        this.cargandoPassword = false;
        this.formularioPassword.reset();
        this.notificacion.exito('Contraseña actualizada', 'Tu contraseña se cambió correctamente.');
      },
      error: (error) => {
        this.cargandoPassword = false;
        const mensaje = error.error?.mensaje || 'No se pudo cambiar la contraseña.';
        this.notificacion.error('Error', mensaje);
      }
    });
  }

  ngOnDestroy(): void {
    this.sonidoService.detenerActual();
  }
}