import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ObrasService } from '../../services/obras.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Obra } from '../../models/obra.model';
import { SonidoZonaService } from '../../services/sonido-zona.service';
import { ControlSonidoComponent } from '../../components/control-sonido/control-sonido.component';
import { EfectoFondoSutilComponent } from '../../components/efecto-fondo-sutil/efecto-fondo-sutil.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-obras',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ControlSonidoComponent, EfectoFondoSutilComponent],
  templateUrl: './admin-obras.component.html',
  styleUrl: './admin-obras.component.css'
})
export class AdminObrasComponent implements OnInit, OnDestroy {
  obras: Obra[] = [];
  cargando = true;
  formularioVisible = false;
  modoEdicion = false;
  idEnEdicion: string | null = null;
  guardando = false;
  formulario: FormGroup;
  archivoSeleccionado: File | null = null;
  previsualizacion: string | null = null;
  imagenActualEdicion: string | null = null;
  categorias = ['pintura', 'escultura', 'musica', 'digital', 'fotografia', 'otro'];
  vistaActual: 'activas' | 'papelera' = 'activas';
  papelera: (Obra & { diasRestantes: number })[] = [];
  cargandoPapelera = false;
  constructor(
    private obrasService: ObrasService,
    private notificacion: NotificacionService,
    private fb: FormBuilder,
    private sonidoService: SonidoZonaService
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      tituloEn: [''],
      descripcion: ['', [Validators.maxLength(1000)]],
      serie: [''],
      precio: [0, [Validators.required, Validators.min(1)]],
      categoria: ['escultura', [Validators.required]],
      enVenta: [false]
    });
  }

  ngOnInit(): void {
    this.sonidoService.reproducirZona('panel-obras');
    this.cargarObras();
  }
  ngOnDestroy(): void {
    this.sonidoService.detenerActual();
  }
  cargarObras(): void {
    this.cargando = true;
    this.obrasService.obtenerTodas().subscribe({
      next: (respuesta) => {
        this.obras = respuesta.obras;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.notificacion.error('Error al cargar', 'No pudimos traer las obras.');
      }
    });
  }
  cambiarVista(vista: 'activas' | 'papelera'): void {
    this.vistaActual = vista;
    if (vista === 'papelera') {
      this.cargarPapelera();
    }
  }
  cargarPapelera(): void {
    this.cargandoPapelera = true;
    this.obrasService.obtenerPapelera().subscribe({
      next: (respuesta) => {
        this.papelera = respuesta.obras;
        this.cargandoPapelera = false;
      },
      error: () => {
        this.cargandoPapelera = false;
        this.notificacion.error('Error', 'No pudimos cargar la papelera.');
      }
    });
  }
  restaurarObra(obra: Obra): void {
    this.obrasService.restaurar(obra._id).subscribe({
      next: () => {
        this.notificacion.exito('Obra restaurada', `"${obra.titulo}" volvió al listado activo.`);
        this.cargarPapelera();
        this.cargarObras();
      },
      error: () => {
        this.notificacion.error('No se pudo restaurar', 'Intentá de nuevo.');
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
    this.imagenActualEdicion = null;
    this.formulario.reset({ precio: 0, categoria: 'escultura', enVenta: false });
    this.formularioVisible = true;
  }
  abrirFormularioEdicion(obra: Obra): void {
    this.modoEdicion = true;
    this.idEnEdicion = obra._id;
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
    this.imagenActualEdicion = obra.imagenPortada;
    this.formulario.setValue({
      titulo: obra.titulo,
      tituloEn: obra.tituloEn || '',
      descripcion: obra.descripcion || '',
      serie: obra.serie || '',
      precio: obra.precio,
      categoria: obra.categoria,
      enVenta: obra.enVenta
    });
    this.formularioVisible = true;
  }
  cancelarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
  }
  onArchivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    if (!archivo) {
      this.archivoSeleccionado = null;
      this.previsualizacion = null;
      return;
    }
    this.archivoSeleccionado = archivo;
    const lector = new FileReader();
    lector.onload = () => {
      this.previsualizacion = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (!this.modoEdicion && !this.archivoSeleccionado) {
      this.notificacion.error('Falta la imagen', 'Seleccioná una imagen de portada antes de crear la obra.');
      return;
    }
    this.guardando = true;
    const formData = new FormData();
    const valores = this.formulario.value;
    Object.keys(valores).forEach((clave) => {
      formData.append(clave, valores[clave]);
    });
    if (this.archivoSeleccionado) {
      formData.append('imagenPortada', this.archivoSeleccionado);
    }
    const peticion = this.modoEdicion && this.idEnEdicion
      ? this.obrasService.actualizar(this.idEnEdicion, formData)
      : this.obrasService.crear(formData);
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.notificacion.exito(
          this.modoEdicion ? 'Obra actualizada' : 'Obra creada',
          this.modoEdicion ? 'Los cambios se guardaron correctamente.' : 'La obra ya está publicada.'
        );
        this.formularioVisible = false;
        this.cargarObras();
      },
      error: (error) => {
        this.guardando = false;
        const mensaje = error.error?.mensaje || 'Ocurrió un error al guardar la obra.';
        this.notificacion.error('No se pudo guardar', mensaje);
      }
    });
  }
  async confirmarEliminar(obra: Obra): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${obra.titulo}"?`,
      text: 'La obra se moverá a la papelera. Desde ahí podrás recuperarla o eliminarla para siempre.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      background: '#111318',
      color: '#f1f1f1'
    });
    if (!resultado.isConfirmed) return;
    this.obrasService.eliminar(obra._id).subscribe({
      next: () => {
        this.notificacion.exito('Obra eliminada', `"${obra.titulo}" se movió a la papelera.`);
        this.cargarObras();
      },
      error: () => {
        this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.');
      }
    });
  }
  async confirmarEliminarDefinitivo(obra: Obra): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${obra.titulo}" para siempre?`,
      text: 'Esta acción es irreversible, incluso la imagen se borra de Cloudinary.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar para siempre',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      background: '#111318',
      color: '#f1f1f1'
    });
    if (!resultado.isConfirmed) return;
    this.obrasService.eliminarDefinitivo(obra._id).subscribe({
      next: () => {
        this.notificacion.exito('Eliminada definitivamente', `"${obra.titulo}" ya no existe.`);
        this.cargarPapelera();
      },
      error: () => this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.')
    });
  }
}