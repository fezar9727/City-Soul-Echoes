import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PerfilPublicoService } from '../../services/perfil-publico.service';
import { ObrasService } from '../../services/obras.service';
import { CursosService } from '../../services/cursos.service';
import { PerfilPublico } from '../../models/perfil-publico.model';
import { Obra } from '../../models/obra.model';
import { Curso } from '../../models/curso.model';

@Component({
  selector: 'app-perfil-publico',
  imports: [CommonModule],
  templateUrl: './perfil-publico.component.html',
  styleUrl: './perfil-publico.component.css'
})
export class PerfilPublicoComponent implements OnInit {
  perfil: PerfilPublico | null = null;
  obras: Obra[] = [];
  cursos: Curso[] = [];
  cargando = true;
  cargandoCatalogo = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private perfilPublicoService: PerfilPublicoService,
    private obrasService: ObrasService,
    private cursosService: CursosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.cargando = false;
      return;
    }
    this.perfilPublicoService.obtenerPorId(id).subscribe({
      next: (respuesta) => {
        this.perfil = respuesta.usuario;
        this.cargando = false;
        this.cargarCatalogo(id, respuesta.usuario.rol);
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  private cargarCatalogo(id: string, rol: 'artista' | 'docente'): void {
    if (rol === 'artista') {
      this.obrasService.obtenerTodas(id).subscribe({  
        next: (respuesta) => {
          this.obras = respuesta.obras;
          this.cargandoCatalogo = false;
        },
        error: () => {
          this.cargandoCatalogo = false;
        }
      });
    } else {
      this.cursosService.obtenerTodos(id).subscribe({
        next: (respuesta) => {
          this.cursos = respuesta.cursos;
          this.cargandoCatalogo = false;
        },
        error: () => {
          this.cargandoCatalogo = false;
        }
      });
    }
  }

  get nombrePublico(): string {
    if (!this.perfil) return '';
    if (this.perfil.rol === 'artista') return this.perfil.perfilArtista?.nombreArtistico || this.perfil.nombreCompleto;
    return this.perfil.perfilDocente?.nombrePublico || this.perfil.nombreCompleto;
  }

  get bio(): string {
    if (!this.perfil) return '';
    if (this.perfil.rol === 'artista') return this.perfil.perfilArtista?.bio || '';
    return this.perfil.perfilDocente?.bio || '';
  }

  get enlaceContacto(): string | null {
    if (!this.perfil) return null;
    const perfilRol = this.perfil.rol === 'artista' ? this.perfil.perfilArtista : this.perfil.perfilDocente;
    if (!perfilRol) return null;
    const metodo = perfilRol.metodoContacto;
    const redes = perfilRol.redes;
    if (metodo === 'whatsapp' && redes.whatsapp) return `https://wa.me/${redes.whatsapp}`;
    if (metodo === 'instagram' && redes.instagram) return `https://instagram.com/${redes.instagram}`;
    if (metodo === 'facebook' && redes.facebook) return redes.facebook;
    return `mailto:${this.perfil.correo}`;
  }
}