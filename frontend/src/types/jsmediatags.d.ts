// Redirige la ruta interna del bundle (jsmediatags/dist/jsmediatags.min.js
// — necesaria para esquivar un bug real de resolución de Vite, ya que
// jsmediatags no define "exports" en su package.json) hacia los tipos
// REALES ya publicados en @types/jsmediatags (DefinitelyTyped, paquete
// oficial y mantenido). Cero "any": esto reutiliza la definición de tipos
// completa que ya existe para el paquete raíz, no inventa ningún tipo.
declare module 'jsmediatags/dist/jsmediatags.min.js' {
  import jsmediatags = require('jsmediatags');
  export = jsmediatags;
}