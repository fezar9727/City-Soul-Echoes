import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursosService } from '../../services/cursos.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Curso, CursoPapelera } from '../../models/curso.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-cursos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-cursos.component.html',
  styleUrl: './admin-cursos.component.css'
})
export class AdminCursosComponent implements OnInit {
  cursos: Curso[] = [];
  cargando = true;
  formularioVisible = false;
  modoEdicion = false;
  idEnEdicion: string | null = null;
  guardando = false;
  formulario: FormGroup;
  archivoSeleccionado: File | null = null;
  previsualizacion: string | null = null;
  imagenActualEdicion: string | null = null;
  categorias = ['arte', 'escultura', 'musica', 'digital', 'fotografia', 'emprendimiento', 'bienestar', 'otro'];
  modalidades = ['virtual', 'presencial', 'mixta'];
  vistaActual: 'activos' | 'papelera' = 'activos';
  papelera: CursoPapelera[] = [];
  cargandoPapelera = false;

  constructor(
    private cursosService: CursosService,
    private notificacion: NotificacionService,
    private fb: FormBuilder
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.maxLength(2000)]],
      categoria: ['digital', [Validators.required]],
      modalidad: ['virtual', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracionHoras: [0, [Validators.min(0)]],
      lecciones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarCursos();
  }

  get lecciones(): FormArray {
    return this.formulario.get('lecciones') as FormArray;
  }

  crearLeccion(titulo = '', descripcion = '', duracionMinutos = 0): FormGroup {
    return this.fb.group({
      titulo: [titulo, Validators.required],
      descripcion: [descripcion],
      duracionMinutos: [duracionMinutos, Validators.min(0)]
    });
  }

  agregarLeccion(): void {
    this.lecciones.push(this.crearLeccion());
  }

  quitarLeccion(indice: number): void {
    this.lecciones.removeAt(indice);
  }

  cargarCursos(): void {
    this.cargando = true;
    this.cursosService.obtenerTodos().subscribe({
      next: (respuesta) => {
        this.cursos = respuesta.cursos;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.notificacion.error('Error al cargar', 'No pudimos traer los cursos.');
      }
    });
  }

  cambiarVista(vista: 'activos' | 'papelera'): void {
    this.vistaActual = vista;
    if (vista === 'papelera') {
      this.cargarPapelera();
    }
  }

  cargarPapelera(): void {
    this.cargandoPapelera = true;
    this.cursosService.obtenerPapelera().subscribe({
      next: (respuesta) => {
        this.papelera = respuesta.cursos;
        this.cargandoPapelera = false;
      },
      error: () => {
        this.cargandoPapelera = false;
        this.notificacion.error('Error', 'No pudimos cargar la papelera.');
      }
    });
  }

  restaurarCurso(curso: CursoPapelera): void {
    this.cursosService.restaurar(curso._id).subscribe({
      next: () => {
        this.notificacion.exito('Curso restaurado', `"${curso.titulo}" volvió al listado activo.`);
        this.cargarPapelera();
        this.cargarCursos();
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
    this.lecciones.clear();
    this.formulario.reset({ categoria: 'digital', modalidad: 'virtual', precio: 0, duracionHoras: 0 });
    this.formularioVisible = true;
  }

  abrirFormularioEdicion(curso: Curso): void {
    this.modoEdicion = true;
    this.idEnEdicion = curso._id;
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
    this.imagenActualEdicion = curso.imagenPortada;
    this.lecciones.clear();
    curso.lecciones.forEach((leccion) => {
      this.lecciones.push(this.crearLeccion(leccion.titulo, leccion.descripcion, leccion.duracionMinutos));
    });
    this.formulario.patchValue({
      titulo: curso.titulo,
      descripcion: curso.descripcion || '',
      categoria: curso.categoria,
      modalidad: curso.modalidad,
      precio: curso.precio,
      duracionHoras: curso.duracionHoras
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
      this.notificacion.error('Falta la imagen', 'Seleccioná una imagen de portada antes de crear el curso.');
      return;
    }
    this.guardando = true;
    const formData = new FormData();
    const valores = this.formulario.value;
    formData.append('titulo', valores.titulo);
    formData.append('descripcion', valores.descripcion || '');
    formData.append('categoria', valores.categoria);
    formData.append('modalidad', valores.modalidad);
    formData.append('precio', valores.precio);
    formData.append('duracionHoras', valores.duracionHoras);
    const leccionesConOrden = valores.lecciones.map((leccion: any, indice: number) => ({
      ...leccion,
      orden: indice + 1
    }));
    formData.append('lecciones', JSON.stringify(leccionesConOrden));
    if (this.archivoSeleccionado) {
      formData.append('imagenPortada', this.archivoSeleccionado);
    }
    const peticion = this.modoEdicion && this.idEnEdicion
      ? this.cursosService.actualizar(this.idEnEdicion, formData)
      : this.cursosService.crear(formData);
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.notificacion.exito(
          this.modoEdicion ? 'Curso actualizado' : 'Curso creado',
          this.modoEdicion ? 'Los cambios se guardaron correctamente.' : 'Recordá publicarlo para que se vea en el sitio.'
        );
        this.formularioVisible = false;
        this.cargarCursos();
      },
      error: (error) => {
        this.guardando = false;
        const mensaje = error.error?.mensaje || 'Ocurrió un error al guardar el curso.';
        this.notificacion.error('No se pudo guardar', mensaje);
      }
    });
  }

  togglePublicar(curso: Curso): void {
    this.cursosService.publicar(curso._id).subscribe({
      next: (respuesta) => {
        this.notificacion.exito(
          respuesta.curso.publicado ? 'Curso publicado' : 'Curso despublicado',
          respuesta.curso.publicado ? 'Ya es visible en Aprendizaje.' : 'Ya no aparece en el sitio.'
        );
        this.cargarCursos();
      },
      error: () => this.notificacion.error('No se pudo actualizar', 'Intentá de nuevo.')
    });
  }

  async confirmarEliminar(curso: Curso): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${curso.titulo}"?`,
      text: 'El curso se moverá a la papelera. Desde ahí podrás recuperarlo o eliminarlo para siempre.',
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
    this.cursosService.eliminar(curso._id).subscribe({
      next: () => {
        this.notificacion.exito('Curso eliminado', `"${curso.titulo}" se movió a la papelera.`);
        this.cargarCursos();
      },
      error: () => {
        this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.');
      }
    });
  }

  async confirmarEliminarDefinitivo(curso: CursoPapelera): Promise<void> {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${curso.titulo}" para siempre?`,
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
    this.cursosService.eliminarDefinitivo(curso._id).subscribe({
      next: () => {
        this.notificacion.exito('Eliminado definitivamente', `"${curso.titulo}" ya no existe.`);
        this.cargarPapelera();
      },
      error: () => this.notificacion.error('No se pudo eliminar', 'Intentá de nuevo.')
    });
  }
}