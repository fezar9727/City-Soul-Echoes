// Identificadores de zona — un solo lugar de verdad para los nombres,
// usado tanto por el servicio como por cada componente que dispare un
// sonido. 'panel-obras', 'panel-eventos', 'panel-cursos' reemplazan al
// antiguo 'panel-admin' único — cada panel admin ahora tiene su propio
// audio distinto, en vez de compartir el mismo entre los 3.
export type IdZonaSonido =
  | 'vault'
  | 'vegana'
  | 'moda'
  | 'salud-mental'
  | 'noticias'
  | 'cultura'
  | 'videojuegos'
  | 'editar-perfil'
  | 'panel-obras'
  | 'panel-eventos'
  | 'panel-cursos';

export interface ConfigZonaSonido {
  archivo: string;
  gananciaCalibrada: number;
  /** Multiplicador de velocidad de reproducción (1 = normal). Valores
   * menores a 1 lo hacen sonar más lento y grave — Web Audio API real
   * (AudioBufferSourceNode.playbackRate), no requiere editar el
   * archivo en ninguna herramienta externa. */
  velocidad: number;
}