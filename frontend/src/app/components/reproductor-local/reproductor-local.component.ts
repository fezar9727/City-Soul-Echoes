import { Component, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PistaLocal } from '../../models/pista-local.model';
import { LectorMetadataService } from '../../services/lector-metadata.service';
import { AudioLocalService } from '../../services/audio-local.service';
import { ToastService } from '../../services/toast.service';
import { BibliotecaLocalService } from '../../services/biblioteca-local.service';
import { HistoriaCancionService } from '../../services/historia-cancion.service';

type ModoLoopLocal = 'ninguno' | 'pista' | 'lista';

@Component({
  selector: 'app-reproductor-local',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reproductor-local.component.html',
  styleUrl: './reproductor-local.component.css'
})
export class ReproductorLocalComponent implements OnDestroy {
  @ViewChild('audioLocal') audioLocalRef!: ElementRef<HTMLAudioElement>;

  playlist: PistaLocal[] = [];
  indiceActual = 0;
  reproduciendo = false;
  cargandoArchivos = false;
  volumen = 0.7;
  aleatorio = false;
  modoLoop: ModoLoopLocal = 'ninguno';
  tiempoActualSegundos = 0;
  private historialAleatorio: number[] = [];

  boostVolumen = 1;
  mostrarBoost = false;
  private avisoBoostMostrado = false;
  private readonly UMBRAL_AVISO = 1.5;

  mostrarBibliotecaGuardada = false;

  listas: { id: string; nombre: string; pistaIds: string[] }[] = [];
  listaActivaId: string | null = null;

  constructor(
    private lectorMetadata: LectorMetadataService,
    private audioLocalService: AudioLocalService,
    private toast: ToastService,
    private biblioteca: BibliotecaLocalService,
    private historiaCancionService: HistoriaCancionService
  ) {
    this.biblioteca.listarPistas().then(async pistas => {
      this.mostrarBibliotecaGuardada = pistas.length > 0;
      // Carga automática SOLO de los handles cuyo permiso ya está
      // 'granted' sin pedir nada (queryPermission, sin gesto real
      // requerido) — así la playlist "aparece siempre" apenas se
      // pueda, sin click. Los que ya no tienen permiso concedido se
      // quedan para el botón manual (requestPermission sí exige un
      // gesto real del usuario, restricción de seguridad real del
      // navegador, no evitable).
      for (const entrada of pistas) {
        const yaConcedido = await (entrada.handle as any).queryPermission({ mode: 'read' }).catch(() => 'denied');
        if (yaConcedido !== 'granted') continue;
        try {
          const archivo = await entrada.handle.getFile();
          const urlObjeto = URL.createObjectURL(archivo);
          const caratulaUrl = entrada.caratulaBlob ? URL.createObjectURL(entrada.caratulaBlob) : null;
          this.playlist.push({
            id: entrada.id,
            archivo,
            titulo: entrada.titulo,
            artista: entrada.artista,
            album: entrada.album,
            anio: '',
            duracionSegundos: 0,
            urlObjeto,
            caratulaUrl
          });
        } catch {
          // Archivo movido/desconectado — se omite, sigue el resto.
        }
      }
    });
    this.biblioteca.listarListas().then(listas => {
      this.listas = listas;
    });
  }

  get pistaActual(): PistaLocal | null {
    return this.playlist[this.indiceActual] ?? null;
  }

  get pistasVisibles(): PistaLocal[] {
    if (!this.listaActivaId) return this.playlist;
    const lista = this.listas.find(l => l.id === this.listaActivaId);
    if (!lista) return this.playlist;
    return this.playlist.filter(p => lista.pistaIds.includes(p.id));
  }

  soportaFileSystemAccess(): boolean {
    return 'showOpenFilePicker' in window;
  }

  async abrirSelectorModerno(): Promise<void> {
    try {
      const handles: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
        multiple: true,
        types: [{ description: 'Audio', accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac'] } }]
      });
      const archivos = await Promise.all(handles.map((h) => h.getFile()));
      const cantidadAntes = this.playlist.length;
      await this.procesarArchivos(archivos);
      // Guardado real en biblioteca — SOLO esta ruta entrega handles
      // reutilizables (limitación real de la File System Access API,
      // solo Chrome/Edge — drag&drop e <input type="file"> nunca dan
      // un handle reusable, es una restricción del navegador).
      for (let i = 0; i < handles.length; i++) {
        const pistaNueva = this.playlist[cantidadAntes + i];
        if (!pistaNueva) continue;
        const caratulaBlob = pistaNueva.caratulaUrl
          ? await fetch(pistaNueva.caratulaUrl).then(r => r.blob())
          : null;
        await this.biblioteca.guardarPista({
          id: pistaNueva.id,
          handle: handles[i],
          titulo: pistaNueva.titulo,
          artista: pistaNueva.artista,
          album: pistaNueva.album,
          caratulaBlob
        });
      }
      this.mostrarBibliotecaGuardada = true;
    } catch {
      // Usuario canceló el selector — no es un error real.
    }
  }

  async alSeleccionarArchivos(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    if (!input.files?.length) return;
    await this.procesarArchivos(Array.from(input.files));
  }

  arrastrandoArchivo = false;
  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoArchivo = true;
  }
  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoArchivo = false;
  }
  async onDrop(evento: DragEvent): Promise<void> {
    evento.preventDefault();
    this.arrastrandoArchivo = false;
    const archivos = evento.dataTransfer?.files;
    if (!archivos?.length) return;
    await this.procesarArchivos(Array.from(archivos));
  }

  async abrirBibliotecaGuardada(): Promise<void> {
    const entradas = await this.biblioteca.listarPistas();
    for (const entrada of entradas) {
      const permitido = await this.biblioteca.pedirPermiso(entrada.handle);
      if (!permitido) continue;
      try {
        const archivo = await entrada.handle.getFile();
        const urlObjeto = URL.createObjectURL(archivo);
        const caratulaUrl = entrada.caratulaBlob ? URL.createObjectURL(entrada.caratulaBlob) : null;
        this.playlist.push({
          id: entrada.id,
          archivo,
          titulo: entrada.titulo,
          artista: entrada.artista,
          album: entrada.album,
          anio: '',
          duracionSegundos: 0,
          urlObjeto,
          caratulaUrl
        });
      } catch {
        // Archivo movido/borrado/USB desconectado — se omite esa pista.
      }
    }
    if (!this.pistaActual && this.playlist.length) this.seleccionarPista(0);
  }

  private async procesarArchivos(archivos: File[]): Promise<void> {
    this.cargandoArchivos = true;
    const soloAudio = archivos.filter(a => a.type.startsWith('audio/'));
    const pistasNuevas = await Promise.all(soloAudio.map(a => this.lectorMetadata.leerPista(a)));
    this.playlist = [...this.playlist, ...pistasNuevas];
    this.cargandoArchivos = false;
    if (!this.pistaActual && this.playlist.length) this.seleccionarPista(0);
  }

  cambiarBoost(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.boostVolumen = valor;
    this.audioLocalService.aplicarBoost(valor);
    if (valor >= this.UMBRAL_AVISO && !this.avisoBoostMostrado) {
      this.avisoBoostMostrado = true;
      this.toast.mostrar(
        'Volumen elevado por encima del nivel recomendado — cuidá tus oídos y tus parlantes.',
        'advertencia'
      );
    }
    const input = evento.target as HTMLInputElement;
    input.classList.add('rack-discoteca');
    clearTimeout(this.timeoutDisco);
    this.timeoutDisco = setTimeout(() => input.classList.remove('rack-discoteca'), 400);
  }

  cambiarVolumen(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.volumen = Math.min(Math.max(valor, 0), 1);
    if (this.audioLocalRef?.nativeElement) {
      this.audioLocalRef.nativeElement.volume = this.volumen;
    }
    // "Vuelo" del avioncito solo mientras se arrastra el slider —
    // se agrega la clase al elemento real, se quita 300ms después
    // del último input (debounce simple con timeout reiniciado).
    const input = evento.target as HTMLInputElement;
    input.classList.add('rack-volando');
    clearTimeout(this.timeoutVolando);
    this.timeoutVolando = setTimeout(() => input.classList.remove('rack-volando'), 300);
  }
  private timeoutVolando: ReturnType<typeof setTimeout> | undefined;

  private timeoutDisco: ReturnType<typeof setTimeout> | undefined;

  seleccionarPista(indice: number): void {
    this.indiceActual = indice;
    this.historialAleatorio = [indice];
    this.reproducirDesdeInicio();
  }

  togglePlayPause(): void {
    const audio = this.audioLocalRef.nativeElement;
    if (this.reproduciendo) {
      audio.pause();
      this.reproduciendo = false;
    } else {
      // Sin src todavía => arranca desde el inicio; si ya había src
      // cargado, retoma en la misma posición (audio.currentTime).
      if (!audio.src) {
        this.reproducirDesdeInicio();
      } else {
        audio.play();
        this.reproduciendo = true;
      }
    }
  }

  private reproducirDesdeInicio(): void {
    const audio = this.audioLocalRef.nativeElement;
    audio.src = this.pistaActual?.urlObjeto ?? '';
    audio.volume = this.volumen;
    this.audioLocalService.conectar(audio);
    this.audioLocalService.aplicarBoost(this.boostVolumen);
    audio.play();
    this.reproduciendo = true;
  }

  onMetadataCargada(): void {
    const audio = this.audioLocalRef?.nativeElement;
    if (!audio || !this.pistaActual) return;
    this.pistaActual.duracionSegundos = audio.duration || 0;
  }

  onTiempoActualizado(): void {
    this.tiempoActualSegundos = this.audioLocalRef?.nativeElement.currentTime ?? 0;
  }

  buscarPosicion(evento: Event): void {
    const audio = this.audioLocalRef?.nativeElement;
    if (!audio) return;
    const nuevoTiempo = Number((evento.target as HTMLInputElement).value);
    audio.currentTime = nuevoTiempo;
    this.tiempoActualSegundos = nuevoTiempo;
  }

  avanzar10s(): void {
    const audio = this.audioLocalRef?.nativeElement;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  }
  retroceder10s(): void {
    const audio = this.audioLocalRef?.nativeElement;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }

  private elegirIndiceAleatorio(): number {
    if (this.playlist.length <= 1) return this.indiceActual;
    let candidato: number;
    do {
      candidato = Math.floor(Math.random() * this.playlist.length);
    } while (candidato === this.indiceActual);
    return candidato;
  }

  pistaSiguiente(): void {
    if (this.aleatorio) {
      this.indiceActual = this.elegirIndiceAleatorio();
      this.historialAleatorio.push(this.indiceActual);
    } else if (this.indiceActual < this.playlist.length - 1) {
      this.indiceActual++;
    } else {
      this.indiceActual = 0;
    }
    this.reproducirDesdeInicio();
  }

  pistaAnterior(): void {
    if (this.aleatorio && this.historialAleatorio.length > 1) {
      this.historialAleatorio.pop();
      this.indiceActual = this.historialAleatorio[this.historialAleatorio.length - 1];
    } else if (this.indiceActual > 0) {
      this.indiceActual--;
    } else {
      this.indiceActual = this.playlist.length - 1;
    }
    this.reproducirDesdeInicio();
  }

  alTerminarPista(): void {
    if (this.modoLoop === 'pista') {
      this.reproducirDesdeInicio();
      return;
    }
    if (this.modoLoop === 'ninguno' && !this.aleatorio && this.indiceActual === this.playlist.length - 1) {
      this.reproduciendo = false;
      return;
    }
    this.pistaSiguiente();
  }

  alternarAleatorio(): void {
    this.aleatorio = !this.aleatorio;
    if (this.aleatorio) this.historialAleatorio = [this.indiceActual];
  }

  ciclarModoLoop(): void {
    const orden: ModoLoopLocal[] = ['ninguno', 'lista', 'pista'];
    const i = orden.indexOf(this.modoLoop);
    this.modoLoop = orden[(i + 1) % orden.length];
  }

  // Wrapper del prompt() nativo — Angular no permite invocar
  // funciones globales del navegador directo en el template.
  async crearListaConPrompt(): Promise<void> {
    const nombre = window.prompt('Nombre de la lista');
    if (nombre) await this.crearLista(nombre);
  }

  async crearLista(nombre: string): Promise<void> {
    if (!nombre.trim()) return;
    const nueva = { id: `lista-${Date.now()}`, nombre: nombre.trim(), pistaIds: [] as string[] };
    this.listas.push(nueva);
    await this.biblioteca.guardarLista(nueva);
  }

  async eliminarLista(listaId: string, evento: Event): Promise<void> {
    evento.stopPropagation();
    const confirmado = window.confirm('¿Eliminar esta lista? Las canciones no se borran, solo la lista.');
    if (!confirmado) return;
    this.listas = this.listas.filter(l => l.id !== listaId);
    if (this.listaActivaId === listaId) this.listaActivaId = null;
    await this.biblioteca.eliminarLista(listaId);
  }

  // Toggle real: agrega si no está, quita si ya estaba — un solo
  // método cubre las 2 acciones, coherente con el menú del HTML
  // (checkbox por lista, click alterna la membresía).
  async alternarPistaEnLista(listaId: string, pistaId: string): Promise<void> {
    const lista = this.listas.find(l => l.id === listaId);
    if (!lista) return;
    const yaEsta = lista.pistaIds.includes(pistaId);
    lista.pistaIds = yaEsta
      ? lista.pistaIds.filter(id => id !== pistaId)
      : [...lista.pistaIds, pistaId];
    await this.biblioteca.guardarLista(lista);
  }

  // Controla qué menú de "agregar a lista" está abierto — solo uno
  // a la vez, por id de pista. menuListasPos: coordenadas REALES del
  // botón clickeado (getBoundingClientRect) — el menú se posiciona
  // como capa flotante con position:fixed usando estas coordenadas,
  // en vez de vivir dentro de .rack-lista (que tiene overflow-y:auto
  // y RECORTA cualquier hijo absolute que se salga de su área
  // visible — causa real confirmada del bug reportado).
  menuListasAbiertoPara: string | null = null;
  menuListasPos = { top: 0, left: 0 };
  toggleMenuListas(pistaId: string, evento: Event): void {
    evento.stopPropagation();
    if (this.menuListasAbiertoPara === pistaId) {
      this.menuListasAbiertoPara = null;
      return;
    }
    const boton = evento.currentTarget as HTMLElement;
    const rect = boton.getBoundingClientRect();
    this.menuListasPos = { top: rect.bottom + 4, left: rect.right - 170 };
    this.menuListasAbiertoPara = pistaId;
  }

  @HostListener('document:click')
  cerrarMenuListas(): void {
    this.menuListasAbiertoPara = null;
  }

  // ID fijo (no timestamp) para que "Favoritos" sea siempre la MISMA
  // lista real entre sesiones — se crea sola la primera vez que se
  // toca un corazón, y se puede borrar como cualquier otra lista
  // (eliminarLista ya funciona genérico, sin caso especial).
  private readonly ID_LISTA_FAVORITOS = 'lista-favoritos';

  esFavorito(pistaId: string): boolean {
    const favoritos = this.listas.find(l => l.id === this.ID_LISTA_FAVORITOS);
    return favoritos ? favoritos.pistaIds.includes(pistaId) : false;
  }

  async alternarFavorito(pistaId: string, evento: Event): Promise<void> {
    evento.stopPropagation();
    let favoritos = this.listas.find(l => l.id === this.ID_LISTA_FAVORITOS);
    if (!favoritos) {
      favoritos = { id: this.ID_LISTA_FAVORITOS, nombre: '❤ Favoritos', pistaIds: [] };
      this.listas.push(favoritos);
    }
    const yaEsta = favoritos.pistaIds.includes(pistaId);
    favoritos.pistaIds = yaEsta
      ? favoritos.pistaIds.filter(id => id !== pistaId)
      : [...favoritos.pistaIds, pistaId];
    await this.biblioteca.guardarLista(favoritos);
  }

  // Carátula ampliada — diseño propio, no reutiliza el flip de Soul
  // Station. Sin caché de resultados: la búsqueda es liviana y
  // sucede solo al abrir, no en cada frame ni automáticamente.
  caratulaAmpliada = false;
  caratulaVolteada = false;
  cargandoHistoria = false;
  historiaCancion: string | null = null;

  abrirCaratulaAmpliada(): void {
    if (!this.pistaActual) return;
    this.caratulaAmpliada = true;
    this.caratulaVolteada = false;
    this.historiaCancion = null;
  }

  cerrarCaratulaAmpliada(): void {
    this.caratulaAmpliada = false;
  }

  async toggleFlipCaratula(): Promise<void> {
    this.caratulaVolteada = !this.caratulaVolteada;
    // Buscar la historia solo al voltear por primera vez a esta
    // pista — evita golpear la API pública en cada click de vuelta.
    if (this.caratulaVolteada && !this.historiaCancion && this.pistaActual) {
      this.cargandoHistoria = true;
      this.historiaCancion = await this.historiaCancionService.buscarInfo(
        this.pistaActual.titulo,
        this.pistaActual.artista
      );
      this.cargandoHistoria = false;
    }
  }


  formatearDuracion(segundos: number): string {
    if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
    const total = Math.floor(segundos);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.playlist.forEach(p => {
      URL.revokeObjectURL(p.urlObjeto);
      if (p.caratulaUrl) URL.revokeObjectURL(p.caratulaUrl);
    });
    this.audioLocalService.cerrar();
  }
}