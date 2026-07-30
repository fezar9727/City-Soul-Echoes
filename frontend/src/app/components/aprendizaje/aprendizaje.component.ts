import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosService } from '../../services/cursos.service';
import { Curso } from '../../models/curso.model';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-aprendizaje',
  imports: [CommonModule, RevealDirective],
  templateUrl: './aprendizaje.component.html',
  styleUrl: './aprendizaje.component.css'
})
export class AprendizajeComponent implements OnInit {
  cursos: Curso[] = [];
  cargando = true;
  cursoEnDetalle: Curso | null = null;

  constructor(private cursosService: CursosService) {}

  ngOnInit(): void {
    this.cursosService.obtenerTodos().subscribe({
      next: (respuesta) => {
        this.cursos = respuesta.cursos;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  abrirDetalle(curso: Curso): void {
    this.cursoEnDetalle = curso;
  }

  cerrarDetalle(): void {
    this.cursoEnDetalle = null;
  }

  nombreDocenteDe(curso: Curso): string {
    if (typeof curso.docente === 'string') {
      return 'Docente';
    }
    return curso.docente.perfilDocente?.nombrePublico || curso.docente.nombreCompleto || 'Docente';
  }
}