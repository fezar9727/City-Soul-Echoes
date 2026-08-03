import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventosService } from '../../services/eventos.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Evento, EventoPapelera } from '../../models/evento.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-eventos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-eventos.component.html',
  styleUrl: './admin-eventos.component.css'
})
export class AdminEventosComponent implements OnInit {
  eventos: Evento[] = [];
  cargando = true;
  formularioVisible = false;
  modoEdicion = false;
  idEnEdicion: string | null = null;
  guardando = false;
  formulario: FormGroup;
  archivoSeleccionado: File | null = null;
  previsualizacion: string | null = null;
  imagenActualEdicion: string | null = null;
  tipos = ['evento', 'viernes-cultural'];
  vistaActual: 'activos' | 'papelera' | 'moderacion' = 'activos';
  papelera: EventoPapelera[] = [];
  cargandoPapelera = false;
  pendientesModeracion: Evento[] = [];
  cargandoModeracion = false;

  constructor(
    private eventosService: EventosService,
    private notificacion: NotificacionService,
    private fb: FormBuilder
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.maxLength(1000)]],
      tipo: ['evento', [Validators.required]],
      fecha: ['', [Validators.required]],
      hora: ['19:00', [Validators.required]],
      linkSala: [''],
      accesoPúblico: [true],
      cupos: [0]
    });
  }

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargando = true;
    this.eventosService.obtenerTodos().subscribe({
      next: (respuesta) => {
        this.eventos = respuesta.eventos;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.notificacion.error('Error al cargar', 'No pudimos traer los eventos.');
      }
    });
  }

  cambiarVista(vista: 'activos' | 'papelera' | 'moderacion'): void {
    this.vistaActual = vista;
    if (vista === 'papelera') {
      this.cargarPapelera();
    }
    if (vista === 'moderacion') {
      this.cargarModeracion();
    }
  }

  cargarModeracion(): void {
    this.cargandoModeracion = true;
    this.eventosService.obtenerPendientesModeracion().subscribe({
      next: (respuesta) => {
        this.pendientesModeracion = respuesta.eventos;
        this.cargandoModeracion = false;
      },
      error: () => {
        this.cargandoModeracion = false;
        this.notificacion.error('Error', 'No pudimos cargar los eventos pendientes.');
      }
    });
  }

  aprobarEvento(evento: Evento): void {
    this.eventosService.moderar(evento._id, 'aprobado').subscribe({
      next: () => {
        this.notificacion.exito('Evento aprobado', `"${evento.titulo}" ya es visible en el sitio.`);
        this.cargarModeracion();
        this.cargarEventos();
      },
      error: () => this.notificacion.error('No se pudo aprobar', 'Intentá de nuevo.')
    });
  }

  async rechazarEvento(evento: Evento): Promise<void> {
    const resultado = await Swal.fire({
      title: `Rechazar "${evento.titulo}"`,
      input: 'text',
      inputLabel: 'Motivo del rechazo (el usuario lo va a ver)',
      inputPlaceholder: 'Ej: la imagen se ve borrosa, subí una más clara',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      background: '#111318',
      color: '#f1f1f1',
      inputValidator: (valor) => (!valor ? 'Tenés que escribir un motivo' : undefined)
    });
    if (!resultado.isConfirmed) return;
    this.eventosService.moderar(evento._id, 'rechazado', resultado.value).subscribe({
      next: () => {
        this.notificacion.info('Evento rechazado', `Se le avisó al usuario el motivo.`);
        this.cargarModeracion();
      },
      error: () => this.notificacion.error('No se pudo rechazar', 'Intentá de nuevo.')
    });
  }

  cargarPapelera(): void {
    this.cargandoPapelera = true;
    this.eventosService.obtenerPapelera().subscribe({
      next: (respuesta) => {
        this.papelera = respuesta.eventos;
        this.cargandoPapelera = false;
      },
      error: () => {
        this.cargandoPapelera = false;
        this.notificacion.error('Error', 'No pudimos cargar la papelera.');
      }
    });
  }

  restaurarEvento(evento: EventoPapelera): void {
    this.eventosService.restaurar(evento._id).subscribe({
      next: () => {
        this.notificacion.exito('Evento restaurado', `"${evento.titulo}" volvió al listado activo.`);
        this.cargarPapelera();
        this.cargarEventos();
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
    this.formulario.reset({ tipo: 'evento', hora: '19:00', accesoPúblico: true, cupos: 0 });
    this.formularioVisible = true;
  }

  abrirFormularioEdicion(evento: Evento): void {
    this.modoEdicion = true;
    this.idEnEdicion = evento._id;
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
    this.imagenActualEdicion = evento.imagenPortada;
    this.formulario.setValue({
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      tipo: evento.tipo,
      fecha: evento.fecha ? evento.fecha.substring(0, 10) : '',
      hora: evento.hora,
      linkSala: evento.linkSala || '',
      accesoPúblico: evento.accesoPúblico,
      cupos: evento.cupos
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
      this.notificacion.error('Falta la imagen', 'Seleccioná una imagen de portada antes de crear el evento.');
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
      ? this.eventosService.actualizar(this.idEnEdicion, formData)
      : this.eventosService.crear(formData);
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.notificacion.exito(
          this.modoEdicion ? 'Evento actualizado' : 'Evento creado',
          this.modoEdicion ? 'Los cambios se guardaron correctamente.' : 'El evento ya está publicado.'
        );
        this.formularioVisible = false;
        this.cargarEventos();
      },
      error: (error) => {
        this.guardando = false;
        const mensaje = error.error?.mensaje || 'Ocurrió un error al guardar el evento.';
        this.notificacion.error('No se pudo guardar', mensaje);
      }
    });
  }

  async confirmarEliminar(evento: Evento): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${evento.titulo}"?`,
      text: 'El evento se moverá a la papelera. Desde ahí podrás recuperarlo o eliminarlo para siempre.',
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
    this.eventosService.eliminar(evento._id).subscribe({
      next: () => {
        this.notificacion.exito('Evento eliminado', `"${evento.titulo}" se movió a la papelera.`);
        this.cargarEventos();
      },
      error: () => {
        this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.');
      }
    });
  }

  async confirmarEliminarDefinitivo(evento: EventoPapelera): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${evento.titulo}" para siempre?`,
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
    this.eventosService.eliminarDefinitivo(evento._id).subscribe({
      next: () => {
        this.notificacion.exito('Eliminado definitivamente', `"${evento.titulo}" ya no existe.`);
        this.cargarPapelera();
      },
      error: () => this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.')
    });
  }

  nombreCreadorDe(evento: Evento): string {
    if (typeof evento.creador === 'string') {
      return 'usuario';
    }
    return evento.creador.nombreCompleto || 'usuario';
  }
}