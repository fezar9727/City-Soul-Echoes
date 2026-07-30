/* ============================================
    CITY SOUL ECHOES - script.js
   ============================================ */

'use strict';

/* ====================== 1. SCROLL ANIMATIONS (Intersection Observer) ====================== */

(function () {

    var revealElements = document.querySelectorAll('.reveal, .reveal-card');

    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }

    
    var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            var el = entry.target;

            if (el.classList.contains('reveal-card')) {
                var row = el.closest('.row');
                var siblings = row
                    ? Array.from(row.querySelectorAll('.reveal-card'))
                    : [el];
                var index = siblings.indexOf(el);
                setTimeout(function () {
                    el.classList.add('visible');
                }, index * 150);
            } else {
                el.classList.add('visible');
            }

            observer.unobserve(el);
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0
    });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

})();




/* ====================== 2. LIGHTBOX GALERÍA DE OBRAS ====================== */

(function () {

    var overlay      = document.getElementById('lightbox-overlay');
    var img          = document.getElementById('lightbox-img');
    var titulo       = document.getElementById('lightbox-titulo');
    var desc         = document.getElementById('lightbox-desc');
    var contador     = document.getElementById('lightbox-contador');
    var btnCerrar    = document.getElementById('lightbox-cerrar');
    var btnPrev      = document.getElementById('lightbox-prev');
    var btnNext      = document.getElementById('lightbox-next');
    var barraFill    = document.getElementById('lightbox-barra-fill');
    var miniaturas   = document.getElementById('lightbox-miniaturas');
    var btnQueAbrio  = null;

    if (!overlay) return;

    var obras        = [];
    var indiceActual = 0;
    var autoplayTimer    = null;
    var pausado          = false;
    var AUTOPLAY_SEG     = 22;
    var touchStartX      = 0;

    

/* ---- Mostrar obra ---- */
function mostrarObra(index, direccion) {
    var obra = obras[index];
    if (!obra) return;

    direccion = direccion || 'next';

    var imagenAnterior = img.src;
    var tienePreviaValida = imagenAnterior && !imagenAnterior.endsWith('/');

    /* Texto */
    var tituloCompleto = obra.titulo;
    var matchEn = tituloCompleto.match(/\(([^)]+)\)$/);
    var tituloEs = matchEn ? tituloCompleto.replace(matchEn[0], '').trim() : tituloCompleto;
    var tituloEn = matchEn ? matchEn[1] : '';

    titulo.innerHTML = tituloEs + (tituloEn
        ? '<span class="lightbox-titulo-en">' + tituloEn + '</span>'
        : '');
    desc.textContent     = obra.desc;
    contador.textContent = (index + 1) + ' / ' + obras.length;

    indiceActual = index;
    actualizarMiniaturas();
    reiniciarBarra();

    /* ---- Efecto desintegración ---- */
    if (tienePreviaValida) {
        desintegrarYReintegrar(imagenAnterior, obra.src);
    } else {
        img.src = obra.src;
        img.style.opacity = '1';
    }
}

/* ---- Canvas de desintegración Fiel al Efecto Janemba 3D (Calibrado) ---- */
function desintegrarYReintegrar(srcVieja, srcNueva) {
    var wrapper = document.getElementById('lightbox-imagen-wrapper');
    if (!wrapper) { img.src = srcNueva; return; }

    var canvas = document.getElementById('lightbox-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'lightbox-canvas';
        wrapper.appendChild(canvas);
    }
    var ctx = canvas.getContext('2d');

    var imgTemp = new Image();
    imgTemp.crossOrigin = 'anonymous';
    imgTemp.onload = function () {
        canvas.width  = img.offsetWidth  || 600;
        canvas.height = img.offsetHeight || 400;

        var relacionContenedor = canvas.width / canvas.height;
        var relacionImagen = imgTemp.width / imgTemp.height;
        var dw, dh, dx, dy;

        if (relacionImagen > relacionContenedor) {
            dw = canvas.width;
            dh = canvas.width / relacionImagen;
            dx = 0;
            dy = (canvas.height - dh) / 2;
        } else {
            dh = canvas.height;
            dw = canvas.height * relacionImagen;
            dx = (canvas.width - dw) / 2;
            dy = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgTemp, dx, dy, dw, dh);

        img.classList.add('desintegrando');
        canvas.style.opacity = '1';

        var TAMANO_CUADRO = 70; 
        var cols = Math.ceil(dw / TAMANO_CUADRO);
        var filas = Math.ceil(dh / TAMANO_CUADRO);

        var cuadritos = [];
        for (var f = 0; f < filas; f++) {
            for (var c = 0; c < cols; c++) {
                cuadritos.push({
                    sx: (c * TAMANO_CUADRO) * (imgTemp.width / dw),
                    sy: (f * TAMANO_CUADRO) * (imgTemp.height / dh),
                    sw: (TAMANO_CUADRO) * (imgTemp.width / dw),
                    sh: (TAMANO_CUADRO) * (imgTemp.height / dh),
                    x: dx + (c * TAMANO_CUADRO),
                    y: dy + (f * TAMANO_CUADRO),
                    vx: (Math.random() * 12 - 6), 
                    vy: (Math.random() * 10 - 5), 
                    retraso: Math.random() * 0.65 
                });
            }
        }

        var DURACION_MS = 1700; 
        var inicio      = null;

        function animarDesintegracion(timestamp) {
            if (!inicio) inicio = timestamp;
            var progreso = Math.min((timestamp - inicio) / DURACION_MS, 1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            cuadritos.forEach(function (q) {
                if (progreso < q.retraso) {
                    ctx.drawImage(imgTemp, q.sx, q.sy, q.sw, q.sh, q.x, q.y, TAMANO_CUADRO, TAMANO_CUADRO);
                } else {
                    var t = (progreso - q.retraso) / (1 - q.retraso);
                    if (t < 1) {
                        ctx.save();
                        ctx.globalAlpha = 1 - t;
                        var escala3D = 1 - (t * 0.8); 

                        var posX = q.x + (q.vx * t * 25);
                        var posY = q.y + (q.vy * t * 25);
                        var tamanoFinal = TAMANO_CUADRO * escala3D;
                        var offsetCentro = (TAMANO_CUADRO - tamanoFinal) / 2;

                        ctx.drawImage(imgTemp, q.sx, q.sy, q.sw, q.sh, posX + offsetCentro, posY + offsetCentro, tamanoFinal, tamanoFinal);
                        ctx.restore();
                    }
                }
            });

            if (progreso < 1) {
                requestAnimationFrame(animarDesintegracion);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                img.src = srcNueva;
                img.onload = function () {
                    inicio = null;
                    
                    var relacionImagenNueva = img.naturalWidth / img.naturalHeight;
                    if (relacionImagenNueva > relacionContenedor) {
                        dw = canvas.width; dh = canvas.width / relacionImagenNueva; dx = 0; dy = (canvas.height - dh) / 2;
                    } else {
                        dh = canvas.height; dw = canvas.height * relacionImagenNueva; dx = (canvas.width - dw) / 2; dy = 0;
                    }

                    cuadritos = [];
                    cols = Math.ceil(dw / TAMANO_CUADRO);
                    filas = Math.ceil(dh / TAMANO_CUADRO);
                    for (var f = 0; f < filas; f++) {
                        for (var c = 0; c < cols; c++) {
                            cuadritos.push({
                                sx: (c * TAMANO_CUADRO) * (img.naturalWidth / dw),
                                sy: (f * TAMANO_CUADRO) * (img.naturalHeight / dh),
                                sw: (TAMANO_CUADRO) * (img.naturalWidth / dw),
                                sh: (TAMANO_CUADRO) * (img.naturalHeight / dh),
                                x: dx + (c * TAMANO_CUADRO),
                                y: dy + (f * TAMANO_CUADRO),
                                retraso: Math.random() * 0.6 
                            });
                        }
                    }

                    function animarReintegracion(timestamp) {
                        if (!inicio) inicio = timestamp;
                        var progreso = Math.min((timestamp - inicio) / DURACION_MS, 1);

                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        cuadritos.forEach(function (q) {
                            if (progreso > q.retraso) {
                                var t = Math.min((progreso - q.retraso) / 0.4, 1);
                                ctx.save();
                                ctx.globalAlpha = t;
                                
                                var escala3D = 0.2 + (t * 0.8);
                                var tamanoFinal = TAMANO_CUADRO * escala3D;
                                var centroOffset = (TAMANO_CUADRO - tamanoFinal) / 2;

                                ctx.drawImage(img, q.sx, q.sy, q.sw, q.sh, q.x + centroOffset, q.y + centroOffset, tamanoFinal, tamanoFinal);
                                ctx.restore();
                            }
                        });

                        if (progreso < 1) {
                            requestAnimationFrame(animarReintegracion);
                        } else {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            canvas.style.opacity = '0';
                            img.classList.remove('desintegrando');
                        }
                    }
                    requestAnimationFrame(animarReintegracion);
                };
            }
        }
        requestAnimationFrame(animarDesintegracion);
    };

    imgTemp.onerror = function () {
        img.src = srcNueva;
        img.classList.remove('desintegrando');
        if (canvas) canvas.style.opacity = '0';
    };

    imgTemp.src = srcVieja;
}






    /* ---- Barra de progreso ---- */
    function reiniciarBarra() {
        if (barraFill) {
            barraFill.style.transition = 'none';
            barraFill.style.width = '0%';
            setTimeout(function () {
                barraFill.style.transition = 'width ' + AUTOPLAY_SEG + 's linear';
                barraFill.style.width = '100%';
            }, 30);
        }
    }

    function detenerBarra() {
        if (barraFill) {
            var computedWidth = barraFill.getBoundingClientRect().width;
            var totalWidth = barraFill.parentElement.getBoundingClientRect().width;
            var pct = totalWidth > 0 ? (computedWidth / totalWidth) * 100 : 0;
            barraFill.style.transition = 'none';
            barraFill.style.width = pct + '%';
        }
    }

    /* ---- Autoplay ---- */
    function iniciarAutoplay() {
        clearTimeout(autoplayTimer);
        if (pausado) return;
        autoplayTimer = setTimeout(function () {
            if (!pausado) irSiguiente('auto');
        }, AUTOPLAY_SEG * 1000);
    }

    function pausarAutoplay() {
        pausado = true;
        clearTimeout(autoplayTimer);
        detenerBarra();
    }

    function reanudarAutoplay() {
        pausado = false;
        reiniciarBarra();
        iniciarAutoplay();
    }

    /* ---- Miniaturas ---- */
    function construirMiniaturas() {
        if (!miniaturas) return;
        miniaturas.innerHTML = '';
        obras.forEach(function (obra, i) {
            var thumb = document.createElement('img');
            thumb.src = obra.src;
            thumb.alt = obra.titulo;
            thumb.className = 'lightbox-thumb' + (i === indiceActual ? ' activa' : '');
            thumb.addEventListener('click', function () {
                var dir = i > indiceActual ? 'next' : 'prev';
                mostrarObra(i, dir);
                reiniciarBarra();
                iniciarAutoplay();
            });
            miniaturas.appendChild(thumb);
        });
    }

    function actualizarMiniaturas() {
        if (!miniaturas) return;
        var thumbs = miniaturas.querySelectorAll('.lightbox-thumb');
        thumbs.forEach(function (t, i) {
            t.classList.toggle('activa', i === indiceActual);
        });
        /* Scroll a la miniatura activa */
        if (thumbs[indiceActual]) {
            thumbs[indiceActual].scrollIntoView({ inline: 'center', behavior: 'smooth' });
        }
    }

    /* ---- Navegación ---- */
    function irAnterior() {
        var nuevo = indiceActual === 0 ? obras.length - 1 : indiceActual - 1;
        mostrarObra(nuevo, 'prev');
        reiniciarBarra();
        iniciarAutoplay();
    }

    function irSiguiente(origen) {
        var nuevo = indiceActual === obras.length - 1 ? 0 : indiceActual + 1;
        mostrarObra(nuevo, 'next');
        if (origen !== 'auto') {
            reiniciarBarra();
        }
        iniciarAutoplay();
    }

    /* ---- Abrir / Cerrar ---- */
    function abrirLightbox(obrasData, indice, botonOrigen) {
        obras = obrasData;
        indiceActual = indice || 0;
        btnQueAbrio = botonOrigen || null;
        construirMiniaturas();
        mostrarObra(indiceActual, 'next');
        overlay.classList.add('activo');
        overlay.focus();
        document.body.style.overflow = 'hidden';
        pausado = false;
        iniciarAutoplay();
    }

    function cerrarLightbox() {
        overlay.classList.remove('activo');
        document.body.style.overflow = '';
        img.src = '';
        obras = [];
        clearTimeout(autoplayTimer);
        if (barraFill) {
            barraFill.style.transition = 'none';
            barraFill.style.width = '0%';
        }
        if (btnQueAbrio) {
            btnQueAbrio.focus();
            btnQueAbrio = null;
        }
    }

    /* ---- Eventos de botones ---- */
    document.querySelectorAll('.btn-abrir-lightbox').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = btn.closest('[data-lightbox]');
            if (!card) return;
            try {
                abrirLightbox(JSON.parse(card.dataset.obras), 0, btn);
            } catch (e) {
                console.error('Error al leer obras:', e);
            }
        });
    });

    document.querySelectorAll('[data-lightbox] .card-img-top').forEach(function (imagen) {
        imagen.style.cursor = 'pointer';
        imagen.addEventListener('click', function () {
            var card = imagen.closest('[data-lightbox]');
            if (!card) return;
            try {
                /* Para click en imagen buscamos el btn-abrir-lightbox dentro de la card */
                var btn = card.querySelector('.btn-abrir-lightbox');
                abrirLightbox(JSON.parse(card.dataset.obras), 0, btn);
            } catch (e) {
                console.error('Error al leer obras:', e);
            }
        });
    });

    btnCerrar.addEventListener('click', cerrarLightbox);
    btnPrev.addEventListener('click', irAnterior);
    btnNext.addEventListener('click', irSiguiente);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cerrarLightbox();
    });

    /* ---- Pausa al hover sobre la imagen ---- */
    img.addEventListener('mouseenter', pausarAutoplay);
    img.addEventListener('mouseleave', reanudarAutoplay);

    /* ---- Teclado ---- */
    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('activo')) return;
        if (e.key === 'Escape')     cerrarLightbox();
        if (e.key === 'ArrowLeft')  irAnterior();
        if (e.key === 'ArrowRight') irSiguiente();
    });

    overlay.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('activo')) return;
        if (e.key !== 'Tab') return;

        /* Recoger todos los elementos focusables dentro del overlay */
        var focusables = Array.from(overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(function (el) {
            return !el.disabled && el.offsetParent !== null;
        });

        if (!focusables.length) { e.preventDefault(); return; }

        var first = focusables[0];
        var last  = focusables[focusables.length - 1];

        if (e.shiftKey) {
            /* Shift+Tab: si el foco está en el primero, saltar al último */
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            /* Tab: si el foco está en el último, saltar al primero */
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* ---- Swipe táctil ---- */
    overlay.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    overlay.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) irSiguiente();
            else irAnterior();
        }
    }, { passive: true });

})();


/* ====================== 3. MINI-MAPA LATERAL ====================== */

(function () {

    var puntos   = document.querySelectorAll('.minimapa-punto');
    var secciones = [];

    if (!puntos.length) return;

    /* Construir lista de secciones con sus elementos */
    puntos.forEach(function (punto) {
        var id  = punto.getAttribute('data-seccion');
        var sec = document.getElementById(id);
        if (sec) {
            secciones.push({ id: id, el: sec, punto: punto });
        }
    });

    if (!secciones.length) return;

    function getOffsetTop(el) {
        var top = 0;
        while (el) {
            top += el.offsetTop;
            el = el.offsetParent;
        }
        return top;
    }

    var triggers = [];

    function calcularTriggers() {
        triggers = secciones.map(function (sec) {
            return {
                id     : sec.id,
                punto  : sec.punto,
                offset : getOffsetTop(sec.el)
            };
        });
        triggers.sort(function (a, b) { return a.offset - b.offset; });
    }

    function actualizarMapa() {
        var lineaActivacion = window.scrollY + (window.innerHeight * 0.5);
        var idActivo = null;

        for (var i = triggers.length - 1; i >= 0; i--) {
            if (triggers[i].offset <= lineaActivacion) {
                idActivo = triggers[i].id;
                break;
            }
        }

        puntos.forEach(function (punto) {
            punto.classList.toggle(
                'activo',
                punto.getAttribute('data-seccion') === idActivo
            );
        });
    }

    /* Calcular después de que todo cargue */
    if (document.readyState === 'complete') {
        calcularTriggers();
        actualizarMapa();
    } else {
        window.addEventListener('load', function () {
            calcularTriggers();
            actualizarMapa();
        });
    }

    /* Recalcular en resize con debounce */
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            calcularTriggers();
            actualizarMapa();
        }, 150);
    }, { passive: true });

    /* Scroll optimizado */
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                actualizarMapa();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

})();



/* ====================== 4. BIOGRAFÍA INTERACTIVA ====================== */

(function () {

    var btnToggleBio  = document.getElementById('btn-toggle-bio');
    var containerBio  = document.getElementById('quantum-bio-content');
    var hologramSound = document.getElementById('hologram-sound');
    var bioLoader     = document.getElementById('bio-loader');
    var bioRealText   = document.getElementById('bio-real-text');

    if (!btnToggleBio || !containerBio) return;

    btnToggleBio.addEventListener('click', function () {
        var isOpen = containerBio.classList.contains('is-open');

        if (!isOpen) {
            if (bioRealText) bioRealText.classList.add('is-hidden');
            if (bioLoader) {
                bioLoader.style.display = 'block';
                bioLoader.classList.remove('is-loading');
            }

            containerBio.classList.add('is-open');
            btnToggleBio.setAttribute('aria-expanded', 'true');

            setTimeout(function () {
                if (bioLoader) bioLoader.classList.add('is-loading');

                if (hologramSound) {
                    hologramSound.currentTime = 0;
                    hologramSound.volume = 0.6;
                    hologramSound.play().catch(function (err) {
                        console.warn('Audio bloqueado por política del navegador:', err);
                    });
                }
            }, 30);

            setTimeout(function () {
                if (bioLoader) bioLoader.style.display = 'none';

                if (hologramSound) {
                    hologramSound.pause();
                    hologramSound.currentTime = 0;
                }

                if (bioRealText) bioRealText.classList.remove('is-hidden');
            }, 1700);

        } else {
            containerBio.classList.remove('is-open');
            btnToggleBio.setAttribute('aria-expanded', 'false');

            if (hologramSound) {
                hologramSound.pause();
                hologramSound.currentTime = 0;
            }
        }
    });

    /* Soporte de teclado: Enter y Space abren/cierran (accesibilidad) */
    btnToggleBio.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnToggleBio.click();
        }
    });

})();
