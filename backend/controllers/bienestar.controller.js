const BienestarCache = require('../models/BienestarCache');

const DURACION_CACHE_MS = 2 * 60 * 60 * 1000;

const RUTA_VEGANA_CALI = [
    { titulo: 'Flor de Loto', descripcion: 'Restaurante vegetariano desde 2011. Menú del día siempre vegano, más opciones a la carta.', imagenUrl: '', enlaceOficial: '', pais: 'Cl. 4a #34-40, El Sindicato, Cali' },
    { titulo: 'La Sucursal Vegana', descripcion: 'Comida rápida 100% vegana: hamburguesas, hot dogs, choripán, salchipapa y milkshakes.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 4B Oeste #1-32, Cali' },
    { titulo: 'Vego', descripcion: 'Restaurante vegetariano y vegano en el centro de la ciudad.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 14 #3-01, Cali' },
    { titulo: 'Dulcinea Café Vintage', descripcion: 'Café vintage cerca de la Estación Manzana del Saber, con opciones vegetarianas y veganas.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 26a #3-54, Miraflores, Cali' },
    { titulo: 'Frutos del Sol Bio-Restaurante', descripcion: 'Menú del día vegano a precio fijo, ingredientes orgánicos y tartas veganas de postre.', imagenUrl: '', enlaceOficial: '', pais: 'Cl. 1 Oeste #2-61, Comuna 3, Cali' },
    { titulo: 'Café Momentum', descripcion: 'Café con opciones vegetarianas y veganas, ambiente tranquilo.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 34 #3A-31, Cali' },
    { titulo: 'Mascabado Cocina Artesanal y Casa de Té', descripcion: 'Ambiente de jardín, cocina internacional con opciones veganas, vegetarianas y de carne.', imagenUrl: '', enlaceOficial: '', pais: 'Cali' },
    { titulo: 'Vegano El Buen Alimento', descripcion: 'Café-restaurante reconocido por Lonely Planet. Platos colombianos sin carne, lasaña vegetariana y menú fijo.', imagenUrl: '', enlaceOficial: '', pais: 'Cali' },
    { titulo: 'Vegetariano Kuan Shin Yin Tequendama', descripcion: 'Servicio tipo buffet, amplia variedad de platos vegetarianos y veganos a precio económico.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 44 #5B-37B, Cali' },
    { titulo: 'La Casona Vegetariana', descripcion: 'Menú del día a precio accesible: sopas, platos principales y bebidas, en su mayoría veganas.', imagenUrl: '', enlaceOficial: '', pais: 'Cra. 6 #6-56, Cali' },
    { titulo: 'Tierra Verde', descripcion: 'Restaurante y minimercado vegetariano. Arroces, sanduches y pastas con harinas alternativas, café orgánico.', imagenUrl: '', enlaceOficial: '', pais: 'Cl. 4 Oeste #3-38, Comuna 3, Cali' }
];

const PERFILES_MODA_INCLUSIVA = [

    // ============================================================
    // ADRIANA CONVERS — FAT PANDORA
    // ============================================================
    {
        titulo: 'Adriana Convers ("Fat Pandora")',
        descripcion:
            'Creadora de contenido y activista colombiana vinculada a la aceptación corporal y a la representación de cuerpos diversos en la moda.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.instagram.com/fatpandora/',
        tipoEnlaceOficial: 'instagram',
        enlaceProfundizar:
            'https://co.fashionnetwork.com/news/Falabella-presenta-una-nueva-colaboracion-en-colombia-fat-pandora-x-falabella%2C1314848.html',
        youtubeSearch:
            '"Adriana Convers" "Fat Pandora" entrevista moda inclusiva Colombia Falabella',
        detalleCompleto:
            'Adriana Convers, conocida públicamente como "Fat Pandora", es una creadora de contenido y activista colombiana vinculada a la conversación sobre aceptación corporal, diversidad y representación en la moda. A través de su trabajo en medios digitales ha abordado temas relacionados con la imagen corporal, la autoestima y las dificultades que enfrentan las personas que utilizan tallas grandes dentro de una industria que históricamente ha privilegiado determinados estándares físicos.\n\n' +
            'Su trabajo ha contribuido a visibilizar la necesidad de una representación más amplia de los diferentes tipos de cuerpos. Desde su presencia pública, ha utilizado la comunicación y las redes sociales como espacios para cuestionar los estereotipos asociados con el peso y para defender una visión en la que las personas puedan relacionarse con la moda sin que su cuerpo sea considerado una limitación para acceder a determinadas prendas o tendencias.\n\n' +
            'Uno de los momentos documentados de su trayectoria ocurrió en 2021, cuando participó en una colaboración con Falabella Colombia relacionada con una colección de ropa desarrollada bajo una propuesta de mayor inclusión en tallas y precios. Esta colaboración fue difundida públicamente como una iniciativa relacionada con la diversidad corporal y con la posibilidad de ampliar el acceso a opciones de vestuario para diferentes tipos de cuerpos.\n\n' +
            'Uno de los momentos documentados de su trayectoria ocurrió en 2021, cuando participó en una colaboración con Falabella Colombia relacionada con una colección de ropa desarrollada bajo una propuesta de mayor inclusión en tallas y precios.\n\n' +
            'La participación de creadoras de contenido en conversaciones sobre moda y representación también refleja un cambio en la manera en que se construyen los discursos alrededor de la industria. Las redes sociales han permitido que personas que históricamente tenían una representación limitada puedan expresar sus experiencias, cuestionar prácticas establecidas y promover conversaciones sobre la necesidad de una oferta de moda más diversa.\n\n' +
            'Su trayectoria permite comprender que la inclusión en la moda no se limita únicamente a la creación de prendas. También involucra la representación visual, la comunicación, la disponibilidad de tallas y la posibilidad de que diferentes personas puedan reconocerse en los espacios donde se presentan y promocionan productos de moda.\n\n' +
            'Fuente de referencia: FashionNetwork Colombia, "Falabella presenta una nueva colaboración en Colombia: Fat Pandora X Falabella".'
    },


    // ============================================================
    // GUÍO DOMÍNGUEZ
    // ============================================================
    {
        titulo: 'Guío Domínguez',
        descripcion:
            'Diseñador colombiano relacionado con iniciativas de representación de personas con discapacidad dentro de la industria de la moda.',
        pais: 'Colombia',
        // Antes: '' — Instagram oficial confirmado y aplicado como "ver más".
        enlaceOficial:
            'https://www.instagram.com/guiodicolombia/',
        tipoEnlaceOficial: 'instagram',
        enlaceProfundizar:
            'https://www.notimerica.com/trendsmerica/noticia-disenador-moda-crea-agencia-modelos-discapacidad-20141013160655.html',
        youtubeSearch:
            'Guío Domínguez diseñador colombiano',
        detalleCompleto:
            'Guío Domínguez es un diseñador colombiano documentado por su relación con iniciativas de inclusión y representación de personas con discapacidad en el ámbito del modelaje y la moda. En 2014 fue reportada la creación de una agencia para modelos con discapacidad en Palmira, Colombia, iniciativa que surgió después de que personas con discapacidad se acercaran a él buscando oportunidades para participar como modelos.\n\n' +
            'Esta iniciativa permite abordar una dimensión importante de la moda inclusiva: la representación activa de personas con discapacidad dentro de la industria. Esta perspectiva va más allá de considerar a estas personas únicamente como consumidoras y plantea la necesidad de reconocerlas también como modelos, participantes y protagonistas de espacios relacionados con la moda.\n\n' +
            'La representación tiene un papel importante en la construcción de imaginarios sociales. Cuando diferentes tipos de cuerpos y capacidades aparecen en campañas, pasarelas y proyectos relacionados con la moda, se amplía la percepción de quién puede ocupar estos espacios y se cuestionan los criterios tradicionales utilizados para seleccionar a las personas que participan en ellos.\n\n' +
            'Es importante diferenciar esta dimensión de la moda inclusiva de la moda adaptativa. La información disponible respalda principalmente su relación con la representación y el modelaje de personas con discapacidad, por lo que no se le atribuyen proyectos específicos de diseño adaptativo que no estén suficientemente documentados.\n\n' +
            'El trabajo relacionado con la representación también permite reflexionar sobre la necesidad de una industria más abierta a diferentes capacidades. La inclusión puede comenzar por generar oportunidades de participación y visibilidad, pero también puede extenderse hacia otros ámbitos como el diseño accesible, la producción de prendas adaptadas y la eliminación de barreras dentro de los espacios de moda.\n\n' +
            'Fuente de referencia: Notimérica/Colprensa, "Un diseñador de moda crea una agencia para modelos con discapacidad".'
    },

    // ============================================================
    // ANDREA SAIEH
    // ============================================================
    {
        titulo: 'Andrea Saieh',
        descripcion:
            'Diseñadora colombiana vinculada a proyectos de diseño inclusivo y accesible y participante como fellow de Open Style Lab.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.andreasaieh.com/pages/about',
        tipoEnlaceOficial: 'web',
        enlaceProfundizar:
            'https://www.openstylelab.org/',
        // Antes: búsqueda genérica. Ahora exacta, confirmada porque muestra
        // un video real donde aparece hablando.
        youtubeSearch:
            'Marca colombiana que debes conocer: Andrea Saieh',
        detalleCompleto:
            'Andrea Saieh es una diseñadora colombiana vinculada a proyectos de innovación, diseño y accesibilidad. Su trayectoria profesional se relaciona con la exploración del diseño y con iniciativas que buscan desarrollar soluciones considerando las necesidades de diferentes personas usuarias.\n\n' +
            'Su trabajo refleja una aproximación al diseño en la que las características y necesidades de las personas pueden ser consideradas desde las primeras etapas del proceso creativo. Esta perspectiva resulta especialmente importante cuando se aborda la relación entre moda, accesibilidad y autonomía, ya que las prendas y los objetos de uso cotidiano pueden presentar dificultades para personas con diferentes condiciones físicas o necesidades de movilidad.\n\n' +
            'Su trayectoria incluye su participación como fellow de Open Style Lab, organización dedicada a explorar la relación entre diseño, accesibilidad e inclusión. Dentro de este contexto, Saieh participó en un proyecto relacionado con soluciones de vestimenta para personas con atrofia muscular espinal (AME), una condición que puede generar necesidades específicas relacionadas con el movimiento y la interacción con las prendas.\n\n' +
            'El enfoque de este tipo de proyectos parte de una idea fundamental del diseño inclusivo: las soluciones deben desarrollarse considerando la experiencia real de las personas que utilizarán los productos. Esto implica analizar aspectos como comodidad, funcionalidad, facilidad de uso, movilidad y autonomía, en lugar de limitarse a modificar una prenda convencional después de haber sido diseñada.\n\n' +
            'Es importante precisar que Andrea Saieh fue fellow y participante de proyectos de Open Style Lab; no se presenta como fundadora de la organización. Open Style Lab funciona como una entidad independiente que reúne profesionales y colaboradores de diferentes disciplinas para explorar soluciones de diseño centradas en las necesidades de las personas.\n\n' +
            'La participación en este tipo de iniciativas demuestra cómo la moda puede relacionarse con campos como la investigación, la accesibilidad, la tecnología y el diseño centrado en las personas. También evidencia que la innovación en la vestimenta no necesariamente depende únicamente de crear nuevas tendencias estéticas, sino que puede orientarse a resolver necesidades concretas de quienes encuentran barreras en las prendas convencionales.\n\n' +
            'Fuente de referencia: sitio oficial de Andrea Saieh y Open Style Lab.'
    },

    // ============================================================
    // GENESIS WEBB
    // ============================================================
    {
        titulo: 'Genesis Webb',
        descripcion:
            'Stylist estadounidense reconocida por su trabajo en la construcción de identidades visuales contemporáneas y por su colaboración con artistas de la música y la cultura pop.',
        pais: 'Estados Unidos',
        enlaceOficial:
            'https://www.instagram.com/genesiswbb/',
        tipoEnlaceOficial: 'instagram',
        enlaceProfundizar:
            'https://www.vogue.com/article/genesis-webb-chappell-roan-stylist-interview',
        // Antes: '"Genesis Webb" estilista' (comillas de más reducían resultados).
        youtubeSearch:
            'Genesis Webb estilista',
        detalleCompleto:
            'Genesis Webb es una stylist estadounidense cuyo trabajo se ha relacionado con la construcción de identidades visuales para artistas de la música contemporánea. Su actividad profesional se encuentra vinculada al estilismo, una disciplina que utiliza la ropa, los accesorios, el maquillaje y otros elementos visuales para construir una imagen coherente alrededor de una persona o proyecto artístico.\n\n' +
            'Es especialmente conocida por su trabajo junto a la cantante Chappell Roan, con quien ha desarrollado propuestas de estilismo que combinan referencias teatrales, cultura pop, influencias punk y elementos de estética alternativa. Esta colaboración ha contribuido a construir una identidad visual reconocible alrededor de la artista y de sus presentaciones públicas.\n\n' +
            'El trabajo de una stylist puede desempeñar un papel importante en la construcción de la imagen pública de un artista. Las prendas seleccionadas, las referencias visuales y la combinación de diferentes elementos pueden reforzar una narrativa determinada y ayudar a transmitir conceptos relacionados con la personalidad, la música o la propuesta artística.\n\n' +
            'En el caso de Webb, la utilización de referencias teatrales y elementos visuales llamativos demuestra cómo el estilismo puede alejarse de una interpretación estrictamente comercial de la moda. Las prendas pueden funcionar como parte de una puesta en escena y contribuir a construir personajes, conceptos y universos visuales alrededor de una propuesta musical.\n\n' +
            'Su trayectoria también permite diferenciar claramente entre el trabajo de una stylist y el de una diseñadora de moda. Mientras una diseñadora puede encargarse de crear y desarrollar prendas, una stylist trabaja principalmente en la selección, coordinación y composición de elementos de vestuario para construir una imagen determinada.\n\n' +
            'La información disponible permite identificar a Genesis Webb como una stylist estadounidense y relacionarla profesionalmente con proyectos de imagen vinculados a la música contemporánea. Su trabajo representa una dimensión del estilismo centrada en la expresión visual, la cultura pop y la construcción de identidades artísticas.\n\n' +
            'Fuente de referencia: Vogue, entrevista y perfil profesional sobre Genesis Webb.'
    },

    // ============================================================
    // DEALER BRA
    // ============================================================
    {
        titulo: 'Dealer Bra',
        descripcion:
            'Artista colombiano relacionado con la escena musical urbana y con una estética que conecta música, identidad y cultura callejera.',
        pais: 'Colombia',
        // Antes: '' — se confirma el canal oficial de YouTube "Dealer B.R.A".
        enlaceOficial:
            'https://linktr.ee/dealer_bra',
        tipoEnlaceOficial: 'web',
        // Antes: '' — perfil biográfico encontrado en Quaderno.
        enlaceProfundizar:
            'https://quaderno.app/blog/perfil-biografico-1-dealer-bra-S8U0Db',
        // Antes: '"Dealer B.R.A"' — sin comillas, es el nombre exacto del
        // canal y lleva directo a él.
        youtubeSearch:
            'Dealer B.R.A',
        detalleCompleto:
            'Dealer Bra aparece relacionado con la escena musical urbana colombiana. Dentro de esta selección, su presencia se plantea desde la relación entre música, identidad y cultura callejera, ámbitos en los que la forma de vestir puede convertirse en una parte importante de la expresión personal y artística. Su producción musical se concentra en su canal de YouTube, identificado con el nombre "Dealer B.R.A".\n\n' +
            'La cultura urbana ha utilizado históricamente la ropa, los accesorios y la estética personal como formas de comunicación. Las prendas pueden representar influencias musicales, referencias culturales, pertenencia a una escena o una posición frente a los códigos dominantes de la moda.\n\n' +
            'En las escenas musicales contemporáneas, la imagen de un artista puede estar estrechamente relacionada con su propuesta sonora. La vestimenta, los accesorios y otros elementos visuales pueden complementar la identidad que se construye alrededor de un proyecto musical y contribuir a diferenciarlo dentro de una escena cultural determinada.\n\n' +
            'Existe además un perfil biográfico publicado en la plataforma Quaderno que recoge información sobre su trayectoria. Este tipo de publicaciones permite ampliar el contexto disponible sobre artistas que, como en este caso, no siempre cuentan con cobertura en medios especializados de moda.\n\n' +
            'Sin embargo, la información disponible no permite atribuirle de manera suficientemente documentada trabajos específicos como diseñador de moda, stylist o director creativo. Por esta razón, la descripción se mantiene dentro de los aspectos que pueden sostenerse con la información disponible y evita presentar como hechos afirmaciones profesionales que no cuentan con una fuente inequívoca.\n\n' +
            'La relación entre música urbana y moda permite observar cómo las comunidades creativas construyen códigos propios de vestimenta y expresión. En estos espacios, la ropa puede convertirse en un lenguaje que acompaña la música y comunica referencias culturales, influencias y formas de identidad.\n\n' +
            'Fuente de referencia: canal de YouTube "Dealer B.R.A" y perfil biográfico publicado en Quaderno.'
    },

    // ============================================================
    // TOKIOSTYLING
    // ============================================================
    {
        titulo: 'Tokiostyling',
        descripcion:
            'Proyecto de estilismo asociado con propuestas visuales contemporáneas que conectan moda, música y cultura urbana.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.instagram.com/tokiostyling/',
        tipoEnlaceOficial: 'instagram',
        // Antes: '' — se agrega el registro empresarial encontrado.
        enlaceProfundizar:
            'https://empresas.tusdatos.co/informe/tokio-styling-sas-nit-901921626',
        // Antes: '' — se mantiene vacío a propósito: no arrojó resultados
        // útiles en YouTube. El botón de YouTube no se renderiza si este
        // campo está vacío (ver bienestar.component.html).
        youtubeSearch:
            '',
        detalleCompleto:
            'Tokiostyling se presenta como un proyecto de estilismo asociado con propuestas visuales contemporáneas y con la relación entre moda, música y cultura urbana. Su actividad se sitúa dentro de un contexto creativo en el que el vestuario puede utilizarse como una herramienta para construir imágenes y reforzar la identidad de artistas o proyectos culturales.\n\n' +
            'El nombre también aparece registrado como Tokio Styling SAS, una microempresa colombiana constituida como Sociedad por Acciones Simplificada en 2025, dedicada a actividades especializadas de diseño (CIIU 7410) y ubicada en Bogotá, en la Carrera 20 #134-38.\n\n' +
            'De acuerdo con el registro empresarial disponible, se trata de una operación de tamaño reducido, orientada a ofrecer servicios de diseño de manera personalizada y directa a sus clientes, con presencia activa en el Registro Único Empresarial y Social (RUES) de Colombia.\n\n' +
            'El estilismo contemporáneo puede combinar referencias procedentes de diferentes ámbitos: la cultura urbana, la música, el arte y las tendencias de moda, integrándose para construir una propuesta visual particular en la que la ropa funciona como parte de una narrativa y no únicamente como vestimenta.\n\n' +
            'La información disponible no permite atribuir a Tokiostyling colaboraciones profesionales concretas con artistas específicos sin una fuente directa que lo confirme, por lo que el perfil se mantiene centrado en su actividad general de estilismo y en su registro como empresa de diseño.\n\n' +
            'Fuente de referencia: perfil de Instagram de Tokiostyling y registro empresarial de Tokio Styling SAS disponible en Tusdatos Empresas.'
    },

    // ============================================================
    // KONTRA*
    // ============================================================
    {
        titulo: 'KONTRA*',
        descripcion:
            'Marca y tienda de streetwear colombiana nacida del grafiti bogotano, con tiendas en Bogotá y Medellín.',
        pais: 'Colombia',
        // Antes: '' — Facebook oficial confirmado.
        enlaceOficial:
            'https://www.instagram.com/kontracrew/',
        tipoEnlaceOficial: 'instagram',
        // Antes: '' — artículo de Cartel Urbano con la información verificada.
        enlaceProfundizar:
            'https://cartelurbano.com/moda/marcas-de-diseno-independiente-que-celebran-el-grafiti-y-la-cultura-subterranea',
        enlacesReferencia: [
            { nombre: 'Ubicación de la tienda en Bogotá — Cybo', url: 'https://cl.theinformationspot.com/c/bogotá/tienda-de-ropa/kontra' }
        ],
        // Antes: '"KONTRA" streetwear Colombia marca moda urbana entrevista'
        // — sin resultados útiles en YouTube, se deja vacío.
        youtubeSearch:
            '',
        detalleCompleto:
            'KONTRA* es una marca y tienda de streetwear colombiana fundada en Bogotá en 2011 por integrantes de KAV Crew, un colectivo de grafiteros que decidió convertir su actividad artística en un proyecto de moda mientras aún cursaban estudios universitarios.\n\n' +
            'La marca combina referencias de la cultura pop y urbana en su identidad: sus creadores la describen como una mezcla entre el personaje Juanito Alimaña, el artista Barry McGee, el boxeador Kid Pambelé, el grafitero neoyorquino Case 2 y el productor de hip hop J Dilla. Este cruce de referencias resume su vínculo con el grafiti, el deporte, la música y el arte callejero.\n\n' +
            'KONTRA* mantiene tiendas físicas en Bogotá (Carrera 5 #21-84, con acceso para personas con movilidad reducida) y en Medellín (Calle 8 #42-65, El Poblado), además de realizar envíos a otras ciudades del país. Su producción se concentra en camisetas, sudaderas, chaquetas, calzado y accesorios de estilo urbano, con un enfoque declarado en mantener la fabricación dentro de Colombia.\n\n' +
            'La marca ha colaborado con artistas y colectivos como CMS Caribes, ALM, Gavilán, Paint y la Fundación Canserbero, y organiza anualmente un concurso de ilustración y fotografía. También ha estado vinculada a la producción de conciertos de rap y a la difusión de artistas de la escena urbana latinoamericana.\n\n' +
            'Su origen dentro del grafiti bogotano permite observar cómo una práctica artística nacida en la calle puede transformarse en un proyecto comercial sostenido, sin perder su vínculo con la cultura que le dio origen.\n\n' +
            'Fuente de referencia: Cartel Urbano, "5 marcas de diseño independiente que celebran el grafiti y la cultura subterránea".'
    },

    // ============================================================
    // JERFO
    // ============================================================
    {
        titulo: 'Jerfo',
        descripcion:
            'Julián Eduardo Riaño Flórez, diseñador gráfico y de modas del Quindío conocido como Jerfo, fundador en 2004 de una marca independiente que experimenta con la reasignación de materiales.',
        pais: 'Colombia',
        // Antes: '' — portafolio oficial en Behance.
        enlaceOficial:
            'https://www.behance.net/JERFO',
        tipoEnlaceOficial: 'web',
        // Antes: artículo de Caracol Radio — se reemplaza por el perfil de
        // Cartel Urbano, con información más completa y directamente
        // conectada con detalleCompleto.
        enlaceProfundizar:
            'https://cartelurbano.com/moda/el-disenador-independiente-que-estara-en-colombiamoda-en-medellin',
        // Antes: '"Julián Riaño" Jerfo diseñador de modas Quindío entrevista
        // español' — se deja exactamente como se confirmó que trae más resultados.
        youtubeSearch:
            'Julián Riaño Jerfo diseñador de modas Quindío',
        detalleCompleto:
            'Julián Eduardo Riaño Flórez, conocido como "Jerfo", es un diseñador independiente oriundo del Quindío —con paso por Armenia, Salento y Pijao, además de Cali— que fundó su marca de ropa en 2004. Antes de dedicarse a la moda estudió Diseño Gráfico en el Instituto Departamental de Bellas Artes, formación que después integró a su trabajo como diseñador de prendas.\n\n' +
            'Su propuesta se caracteriza por la experimentación con materiales poco convencionales: cortinas de baño, mallas industriales y forros de colchón, entre otros, que utiliza para generar texturas y composiciones visuales propias. Chaquetas, gabanes y camisas ocupan un lugar central en su producción, que evita la fabricación masiva para mantener un carácter exclusivo.\n\n' +
            'La estética de Jerfo está marcada por la ciencia ficción y por influencias como la banda Daft Punk, elementos que se reflejan en composiciones futuristas y en su interés por incorporar tecnología a futuras colecciones.\n\n' +
            'Su trabajo tiene además una dimensión social: colabora de forma directa con varias madres cabeza de familia encargadas de la confección de las prendas, un modelo que el propio diseñador describe como parte esencial de su proyecto.\n\n' +
            'En 2017 fue seleccionado entre más de 300 diseñadores emergentes convocados por Inexmoda para participar en Colombiamoda, donde presentó la colección "Exclusivity is the holy grail in fashion", inspirada en las noches de La Habana y cargada de destellos dorados, plateados, lentejuelas y estampados.\n\n' +
            'Su presencia activa en plataformas creativas como Behance permite conocer de primera mano sus colecciones y colaboraciones visuales, tanto dentro de Colombia como en el exterior.\n\n' +
            'Fuente de referencia: Cartel Urbano, "Jerfo: diseño independiente y futurista que experimenta con la reasignación de materiales".'
    },

    // ============================================================
    // PEPA POMBO
    // ============================================================
    {
        titulo: 'Pepa Pombo',
        descripcion:
            'Marca colombiana de moda contemporánea reconocida por su trayectoria en el diseño textil y la experimentación con técnicas de tejido desde 1978.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.pepapombo.com/',
        tipoEnlaceOficial: 'web',
        enlaceProfundizar: 
            'https://marieclairecolombia.com/pepa-pombo-coleccion-primavera-verano-2025/',
        youtubeSearch:
            'Pepa Pombo diseñadora colombiana moda tejidos entrevista español',
        detalleCompleto:
            'Pepa Pombo es una marca colombiana de prêt-à-porter que reinventa el tejido de punto desde 1978, con tiendas propias en Cali y Bogotá y venta a través de su sitio web oficial. Su propuesta se caracteriza por la exploración de texturas, superficies y estructuras textiles que forman parte de su identidad estética.\n\n' +
            'La marca fue fundada por Pepa Pombo y, tras 2002, su hija Mónica Holguín asumió la dirección creativa, dando continuidad al trabajo artesanal con el tejido y adaptándolo a nuevas generaciones de clientas.\n\n' +
            'Entre sus compromisos recientes se encuentra la incorporación de materiales sostenibles, como el uso de PET reciclado en algunas de sus colecciones, dentro de una búsqueda por reducir el impacto ambiental de su producción.\n\n' +
            'Su tienda en Cali se encuentra en la calle 16 #103-10, en el centro comercial Casa del Río, mientras que en Bogotá cuenta con varias sedes, entre ellas la Carrera 14 #83-46 y la Calle 79B #7-97, con atención de lunes a domingo.\n\n' +
            'La experimentación textil permite transformar la manera en que se percibe una prenda: las técnicas de tejido utilizadas generan volúmenes y texturas que distinguen a Pepa Pombo dentro del panorama de la moda colombiana contemporánea.\n\n' +
            'Fuente de referencia: sitio oficial de Pepa Pombo.'
    },

    // ============================================================
    // MONOIC
    // ============================================================
    {
        titulo: 'MONOIC',
        descripcion:
            'Marca colombiana de streetwear premium que desarrolla prendas de producción nacional y una estética urbana contemporánea.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.instagram.com/monoic_studios/',
        tipoEnlaceOficial: 'instagram',
        enlaceProfundizar: 'https://monoicstudios.com/',
        // Antes: búsqueda genérica. Ahora exacta: nombre del canal oficial,
        // que tiene varios videos.
        youtubeSearch:
            'MONOIC STUDIOS',
        detalleCompleto:
            'MONOIC, operada legalmente como Monoic S.A.S., es una marca colombiana de streetwear premium constituida en Bogotá el 20 de septiembre de 2023, dedicada al comercio de prendas de vestir y accesorios de diseño propio fabricados en Colombia.\n\n' +
            'Su catálogo incluye camisetas básicas y oversize, graphic tees en ediciones limitadas, hoodies y zip hoodies en algodón de alto gramaje, chaquetas en denim, cuero y drill, así como pantalones tipo jogger y accesorios como gorras y cinturones.\n\n' +
            'La marca vende directamente a través de su sitio oficial, monoicstudios.com, con envíos a nivel nacional e internacional, y mantiene un canal de YouTube activo, MONOIC STUDIOS, donde publica contenido en video sobre sus colecciones.\n\n' +
            'De acuerdo con su registro empresarial, se trata de una microempresa con un equipo reducido de colaboradores, enfocada en ediciones limitadas y en mantener la producción dentro del país como parte de su propuesta de valor.\n\n' +
            'La combinación de producción nacional, ediciones limitadas y una estética urbana contemporánea sitúa a MONOIC dentro del desarrollo reciente del streetwear colombiano de gama alta.\n\n' +
            'Fuente de referencia: sitio oficial de MONOIC y registro empresarial de Monoic S.A.S.'
    },

    // ============================================================
    // ELENA — TE AMAMOS COMO ERES
    // ============================================================
    {
        titulo: 'elenA — Te Amamos Como Eres',
        descripcion:
            'Marca colombiana fundada en 2015, especializada en moda plus size (tallas 14 a 24) y orientada a la celebración de la diversidad corporal.',
        pais: 'Colombia',
        enlaceOficial:
            'https://www.elenaplus.com/',
        tipoEnlaceOficial: 'web',
        enlaceProfundizar: 'https://colombiabz.com/bogota/elena-369272',
        // Antes: búsqueda genérica. Ahora exacta: es el canal oficial, con
        // muchos videos.
        youtubeSearch:
            'Elena Plus Clothing',
        detalleCompleto:
            'elenA — Te Amamos Como Eres es una marca colombiana fundada en 2015, especializada en moda para mujeres de tallas grandes (14 a 24), con presencia en Medellín y Bogotá y ventas a todo el país.\n\n' +
            'Su lema, "Te Amamos Como Eres", resume su misión de inspirar y empoderar a mujeres plus size, promoviendo la aceptación corporal y el amor propio a través de prendas pensadas específicamente para esas tallas.\n\n' +
            'En 2017, elenA organizó la primera pasarela de tallas grandes en Colombia dentro de la feria Colombia Moda, un evento que tuvo repercusión nacional e internacional y que contribuyó a visibilizar la moda plus size en el país.\n\n' +
            'La marca ofrece vestidos, enterizos, conjuntos y ropa interior en tallas grandes, con envíos gratuitos en compras superiores a $250.000 COP, 30 días para cambios y 90 días de garantía, además de disponibilidad en plataformas de domicilios como Rappi.\n\n' +
            'La existencia de propuestas especializadas como esta permite ampliar la oferta disponible para mujeres que históricamente encontraron opciones limitadas en el mercado tradicional de la moda.\n\n' +
            'Fuente de referencia: sitio oficial de elenA — Te Amamos Como Eres.'
    },


    // ============================================================
    // VIVIENNE WESTWOOD
    // ============================================================
    {
        titulo: 'Vivienne Westwood',
        descripcion:
            'Diseñadora británica fundamental para la historia del punk y una figura clave en la transformación de la moda alternativa en una expresión cultural reconocida.',
        pais: 'Reino Unido',
        enlaceOficial:
            'https://www.viviennewestwood.com/',
        tipoEnlaceOficial: 'web',
        // Antes: 'https://www.viviennewestwood.com/pages/about-us' — mismo
        // dominio que enlaceOficial. Se reemplaza por una fuente biográfica
        // independiente.
        enlaceProfundizar:
            'https://www.britannica.com/biography/Vivienne-Westwood',
        youtubeSearch:
            'Vivienne Westwood punk moda historia entrevista documental',
        detalleCompleto:
            'Vivienne Westwood fue una diseñadora británica fundamental para la historia de la moda contemporánea y una de las figuras más importantes relacionadas con la estética punk. Su trabajo inicial junto a Malcolm McLaren en Londres contribuyó a trasladar elementos de la contracultura punk hacia el lenguaje de la moda.\n\n' +
            'Su trayectoria demuestra cómo la moda puede convertirse en una herramienta de expresión cultural y de cuestionamiento de las convenciones establecidas. Sus propuestas incorporaron referencias históricas, elementos deconstructivos, mensajes políticos y una actitud provocadora que influyó en generaciones posteriores.\n\n' +
            'Durante su carrera, Westwood desarrolló una identidad creativa caracterizada por la combinación de tradición y ruptura. Sus diseños reinterpretaron elementos históricos y los mezclaron con referencias contemporáneas, creando propuestas que cuestionaban las ideas convencionales sobre elegancia, silueta y presentación del cuerpo.\n\n' +
            'Su relación con el punk fue especialmente significativa porque ayudó a demostrar que una estética nacida en espacios contraculturales podía convertirse en una fuerza de transformación dentro de la moda. El punk no fue tratado únicamente como una tendencia visual, sino también como una forma de cuestionar normas y expresar posiciones culturales y políticas.\n\n' +
            'Su trayectoria también permite comprender la relación entre moda, identidad y expresión individual. La vestimenta puede utilizarse para comunicar ideas, cuestionar normas sociales y construir una imagen que se aleje deliberadamente de los modelos predominantes.\n\n' +
            'Fuente de referencia: Encyclopaedia Britannica, "Vivienne Westwood".'
    },


    // ============================================================
    // WINNIE HARLOW
    // ============================================================
    {
        titulo: 'Winnie Harlow',
        descripcion:
            'Modelo canadiense con vitiligo que alcanzó reconocimiento internacional y contribuyó a ampliar la representación de diferentes apariencias en la industria de la moda.',
        pais: 'Canadá',
        enlaceOficial:
            'https://www.instagram.com/winnieharlow/',
        tipoEnlaceOficial: 'instagram',
        enlaceProfundizar:
            'https://www.vogue.com/article/winnie-harlow-2018-victorias-secret-show-casting-interview',
        youtubeSearch:
            'Winnie Harlow vitiligo modelo entrevista español Victoria Secret 2018',
        detalleCompleto:
            'Winnie Harlow es una modelo canadiense conocida internacionalmente por su trayectoria profesional y por visibilizar el vitiligo, una condición que produce pérdida de pigmentación en diferentes zonas de la piel. Su presencia en la industria de la moda ha contribuido a ampliar la representación de apariencias que durante mucho tiempo tuvieron poca visibilidad en campañas y medios masivos.\n\n' +
            'Su participación en el Victoria’s Secret Fashion Show de 2018 fue uno de los momentos destacados de su carrera y recibió atención mediática por la presencia de una modelo con vitiligo visible en uno de los eventos comerciales más reconocidos de la industria.\n\n' +
            'El vitiligo ha sido históricamente tratado en muchos contextos desde una perspectiva médica o como una característica que debía ocultarse. La visibilidad de modelos con esta condición ha contribuido a generar conversaciones diferentes sobre la apariencia física y sobre la diversidad presente en los cuerpos humanos.\n\n' +
            'La trayectoria de Harlow también demuestra el papel que pueden desempeñar las figuras públicas en la transformación de las percepciones sociales. La representación de diferentes características físicas en medios y campañas puede contribuir a ampliar los estándares visuales que históricamente han predominado en la industria.\n\n' +
            'Su presencia en espacios de gran alcance internacional ha permitido que el vitiligo sea reconocido por un público más amplio y ha favorecido conversaciones relacionadas con la aceptación de las diferencias visibles. La diversidad en la moda puede entenderse, en este sentido, como una ampliación de las formas en que se representa la belleza.\n\n' +
            'Fuente de referencia: Vogue, entrevista sobre Winnie Harlow y su participación en el Victoria’s Secret Fashion Show de 2018.'
    },

    // ============================================================
    // PERLA DEL CARIBE GONZÁLEZ IPUANA
    // ============================================================
    {
        titulo: 'Perla del Caribe González Ipuana',
        descripcion:
            'Diseñadora wayuu reconocida por su emprendimiento Akumajaa y ganadora del premio "Hilo Dorado" en Estados Unidos por su aporte a la moda ancestral colombiana.',
        pais: 'Colombia (Wayuu)',
        enlaceOficial:
            'https://www.facebook.com/perladelcaribe.gonzalezipuana/about_overview/',
        tipoEnlaceOficial: 'facebook',
        // Antes: el mismo enlace de Akumajaa se repetía como "fuente
        // oficial". Ahora es un artículo independiente sobre su trayectoria.
        enlaceProfundizar:
            'https://laguajirahoy.com/sociales/disenadora-wayuu-fue-galardonada-con-hilo-dorado-durante-encuentro-de-moda-en-estados-unidos.html',
        // Antes: búsqueda genérica. Ahora exacta: es una entrevista real
        // donde aparece ella.
        youtubeSearch:
            'Perla del Caribe: La diseñadora wayuu que lleva la tradición a la moda contemporánea',
        detalleCompleto:
            'Perla del Caribe González Ipuana es una diseñadora wayuu reconocida por su emprendimiento Akumajaa, dedicado a la creación de textiles tradicionales como mantas, chinchorros y mochilas, con presencia en La Guajira y Magdalena desde 2014.\n\n' +
            'En 2021 fue galardonada con el premio “Hilo Dorado” en la octava edición del Colombia Trade Expo International, realizado en Miami, Estados Unidos, en la categoría Muestra Herencia. Su pasarela estuvo inspirada en el canas, las figuras geométricas típicas de las mochilas wayuu.\n\n' +
            'Akumajaa incluye el trabajo de más de 45 artesanas de la ranchería de Punta Koco, en La Guajira, ofreciendo condiciones de trabajo justo y buscando fortalecer la economía local a partir de los tejidos ancestrales wayuu.\n\n' +
            'Creció en La Guajira y estudió diseño en Santa Marta, lo que le permitió combinar técnicas de diseño moderno con la tradición indígena de su comunidad. A través de su trabajo ha buscado que las artesanas wayuu reciban reconocimiento y retribución justa por su labor.\n\n' +
            'La relación entre artesanía y moda contemporánea debe abordarse con especial cuidado: cuando elementos provenientes de comunidades indígenas se incorporan a mercados comerciales, es importante reconocer su origen cultural y valorar el trabajo de quienes mantienen vivas estas tradiciones.\n\n' +
            'Su trayectoria representa al talento indígena colombiano en el panorama internacional de la moda, promoviendo la cultura wayuu y la responsabilidad social dentro del emprendimiento artesanal.\n\n' +
            'Fuente de referencia: La Guajira Hoy.com, “Diseñadora Wayuu fue galardonada con ‘Hilo Dorado’, durante encuentro de moda en Estados Unidos”.'
    },

    // ============================================================
    // HERNÁN ZAJAR
    // ============================================================
    {
        titulo: 'Hernán Zajar',
        descripcion:
            'Diseñador de modas y empresario colombiano de ascendencia libanesa, referente del lujo artesanal y la identidad cultural colombiana en la moda.',
        pais: 'Colombia',
        // Antes: '' — el sitio propio está en construcción, así que el
        // Instagram pasa a ser el "ver más" confirmado.
        enlaceOficial:
            'https://www.instagram.com/hzajar/',
        tipoEnlaceOficial: 'instagram',
        // Antes: el mismo Instagram se repetía como "fuente oficial".
        // Ahora es una fuente biográfica independiente.
        enlaceProfundizar:
            'https://es.wikipedia.org/wiki/Hern%C3%A1n_Zajar',
        // Antes: búsqueda con comillas y "entrevista español" de más.
        // Ahora exacta, confirmada porque trae varias entrevistas reales.
        youtubeSearch:
            'Hernán Zajar diseñador colombiano entrevista',
        detalleCompleto:
            'Hernán Zajar nació el 12 de julio de 1956 en Santa Cruz de Mompox, Bolívar, y es un diseñador de modas y empresario colombiano de ascendencia libanesa. Antes de dedicarse a la moda estudió Administración de Turismo y trabajó en hoteles del Caribe, hasta que su verdadera vocación se impuso.\n\n' +
            'Su estilo está marcado por el colorido vibrante del Caribe colombiano y por técnicas artesanales como el croché, el macramé y la filigrana, inspiradas en la cultura de Mompox y Cartagena. Se formó también en Europa y Estados Unidos, lo que le permitió combinar esa tradición caribeña con una mirada internacional.\n\n' +
            'A lo largo de su carrera ha vestido a personalidades como Claudia Schiffer, Ivanka Trump, Joan Collins y Jennifer Lopez, y ha participado en certámenes de belleza, cine, teatro y televisión en Colombia, además de haber sido jurado en programas como Colombia’s Next Top Model y Project Runway Latinoamérica.\n\n' +
            'En 2026 presentó la colección "Amazon Chic" en el Vogue Miami Fashion Week, un trabajo inspirado en la Amazonía colombiana que combina materiales y tejidos tradicionales con una narrativa de lujo artesanal.\n\n' +
            'Entre sus reconocimientos se encuentran el título de Oficial de la Orden Rafael Núñez, el Premio Diseñador Estrella de FENALCO en Barranquilla, el Tairo de Oro del Proyecto Identidad Colombia y su participación como representante del talento colombiano en la Casa Blanca en 2002.\n\n' +
            'Fuente de referencia: Wikipedia, "Hernán Zajar".'
    },

    // ============================================================
    // ANDY WARHOL
    // ============================================================
    {
        titulo: 'Andy Warhol',
        descripcion:
            'Artista estadounidense cuya obra pop art transformó la relación entre arte, cultura popular, consumo, celebridad y moda.',
        pais: 'Estados Unidos',
        enlaceOficial:
            'https://www.warhol.org/',
        tipoEnlaceOficial: 'web',
        // Antes: 'https://www.warhol.org/andy-warhol/' — mismo dominio que
        // enlaceOficial. Ahora es la ficha del artista en el MoMA.
        enlaceProfundizar:
            'https://www.moma.org/artists/6246-andy-warhol',
        // Antes: '"Andy Warhol" Pop Art moda cultura popular documental
        // español' — se deja exactamente como se confirmó.
        youtubeSearch:
            'Andy Warhol Pop Art moda cultura popular documental',
        detalleCompleto:
            'Andy Warhol fue un artista estadounidense fundamental para el desarrollo del pop art y una figura decisiva en la transformación de la relación entre arte, cultura popular, publicidad y consumo. Aunque no fue diseñador de moda, su influencia sobre la cultura visual contemporánea tuvo un impacto importante en la manera en que la moda utiliza imágenes, celebridades, marcas y referencias de la cultura popular.\n\n' +
            'Su obra cuestionó las fronteras tradicionales entre el arte y los objetos de consumo cotidiano. Al convertir productos comerciales e imágenes de personajes famosos en temas artísticos, contribuyó a modificar la forma en que la sociedad entendía la relación entre cultura, identidad y consumo.\n\n' +
            'Warhol desarrolló una estética reconocible basada en la repetición, la reproducción de imágenes y la transformación de elementos cotidianos en objetos de interés artístico. Esta manera de trabajar tuvo una influencia profunda sobre la cultura visual y posteriormente sobre diferentes áreas creativas, incluida la moda.\n\n' +
            'La relación entre Warhol y la moda también puede observarse a través de su cercanía con diseñadores, modelos, músicos y celebridades. Su estudio, conocido como The Factory, funcionó como un espacio de encuentro para diferentes figuras de la cultura contemporánea y contribuyó a consolidar una relación estrecha entre arte, fama, música y estética.\n\n' +
            'Su influencia sobre la moda no se debe a que haya diseñado colecciones de ropa como un diseñador profesional, sino a la manera en que transformó la cultura visual y la percepción de las imágenes. La publicidad, los productos comerciales y las figuras públicas pasaron a formar parte de un lenguaje artístico que posteriormente influyó en la comunicación de numerosas marcas.\n\n' +
            'Su inclusión como referente cultural permite comprender cómo el arte y la moda pueden relacionarse sin que una persona tenga necesariamente que pertenecer profesionalmente a ambas disciplinas. La cultura visual creada alrededor de la obra de Warhol continúa influyendo en campañas, editoriales, diseño gráfico, fotografía y comunicación de moda.\n\n' +
            'Su legado resulta especialmente útil para comprender cómo el arte, la publicidad, la fama y la moda pueden relacionarse dentro de una misma cultura visual. La obra de Warhol continúa siendo estudiada y conservada por instituciones dedicadas a preservar su legado artístico. Su producción representa uno de los capítulos más influyentes del arte estadounidense del siglo XX y continúa teniendo presencia en la cultura visual contemporánea.\n\n' +
            'Fuente de referencia: The Museum of Modern Art (MoMA), ficha de artista de Andy Warhol.'
    }
];

const RECURSOS_SALUD_MENTAL = [
    { titulo: 'Línea 106 — Salud Mental', descripcion: 'Atención psicológica gratuita las 24 horas, todos los días. Orientación, crisis, acompañamiento y consumo de sustancias.', pais: 'Cali / Colombia · Gratis · 24h', etiqueta: 'hablar-ya', telefono: '106' },
    { titulo: 'Línea 123 — Emergencias', descripcion: 'Línea nacional de emergencias para situaciones de riesgo inmediato.', pais: 'Colombia · Gratis · 24h', etiqueta: 'hablar-ya', telefono: '123' },
    { titulo: 'Línea Púrpura', descripcion: 'Apoyo para mujeres en situación de violencia.', pais: 'Colombia · Gratis', etiqueta: 'apoyo-especifico', telefono: '018000112137', whatsapp: '573007551846' },
    { titulo: 'Línea Diversa', descripcion: 'Atención psicosocial para personas LGBT+.', pais: 'Colombia · Gratis', etiqueta: 'apoyo-especifico', whatsapp: '573108644214' },
    { titulo: 'Línea Calma', descripcion: 'Para hombres que buscan gestionar emociones difíciles como celos o ira.', pais: 'Colombia · Gratis', etiqueta: 'apoyo-especifico', telefono: '018004236140' },
    { titulo: 'Línea 141 — ICBF', descripcion: 'Protección para niños, niñas y adolescentes.', pais: 'Colombia · Gratis · 24h', etiqueta: 'apoyo-especifico', telefono: '141' },
    { titulo: 'Línea 155', descripcion: 'Orientación telefónica para mujeres víctimas de violencia.', pais: 'Colombia · Gratis', etiqueta: 'apoyo-especifico', telefono: '155' },
    {
        titulo: 'Sin EPS o en situación migratoria',
        descripcion: 'Cualquier persona en Colombia, tenga o no documentos, tiene derecho a atención de urgencias sin costo.',
        etiqueta: 'apoyo-especifico',
        detalleCompleto: 'Si no tenés EPS, podés acudir directo al hospital o centro de salud público más cercano — por ley están obligados a atenderte en caso de urgencia, sin importar tu documentación. Para regularizar tu situación y acceder a más servicios de forma continua, podés vincularte al régimen subsidiado a través del SISBEN. Si sos migrante, podés afiliarte a una EPS presentando tu Permiso por Protección Temporal (PPT) o tu Permiso Especial de Permanencia (PEP) — ambos te dan acceso al sistema de salud colombiano en igualdad de condiciones. La salud mental está incluida dentro de estos servicios, no es un beneficio aparte.',
        enlaceProfundizar: 'https://www.acnur.org/colombia'
    },
    { titulo: 'Respiración 4-4-6', descripcion: 'Técnica rápida para momentos de ansiedad.', etiqueta: 'autocuidado', youtubeSearch: 'Respiración 4-4-6 ejercicio español', enlacesReferencia: [{ nombre: 'Respiración diafragmática — Universidad Piloto de Colombia', url: 'https://www.unipiloto.edu.co/respiracion-diafragmatica-para-el-manejo-de-la-ansiedad/' }], detalleCompleto: 'Qué es:\nuna técnica de respiración controlada que utiliza un ritmo de inhalar, sostener y exhalar para favorecer la relajación y ayudar a manejar momentos de ansiedad o tensión. El patrón 4-4-6 consiste en inhalar durante 4 segundos, sostener la respiración durante 4 segundos y exhalar lentamente durante 6 segundos.\n\nCómo aplicarla paso a paso:\n(1) Sentate cómodo, con la espalda apoyada y los hombros relajados.\n(2) Inhalá lentamente por la nariz mientras contás hasta 4.\n(3) Sostené el aire durante otros 4 segundos, sin forzar la respiración.\n(4) Exhalá suavemente por la boca mientras contás hasta 6, procurando que la salida del aire sea lenta y controlada.\n(5) Repetí el ciclo completo entre 5 y 8 veces, manteniendo un ritmo cómodo.\n(6) Si en algún momento sentís mareo o incomodidad, detené el ejercicio y retomá una respiración natural.\n\nPor qué puede ayudar:\nuna respiración lenta y controlada puede favorecer una sensación de calma y ayudar a disminuir la tensión física asociada a momentos de estrés o ansiedad. La exhalación prolongada puede facilitar un ritmo respiratorio más tranquilo y ayudar a centrar la atención en el momento presente.\n\nCuándo usarla:\npodés practicarla antes de una situación que te genere nervios, durante un momento de tensión, antes de una entrevista, una llamada difícil o como una pausa breve durante el día. También puede incorporarse como una práctica preventiva de relajación.\n\nCuándo no reemplaza ayuda profesional:\nsi la ansiedad es frecuente, intensa o interfiere con tu vida cotidiana, esta técnica puede utilizarse como complemento, pero no reemplaza la evaluación ni el tratamiento de un profesional de la salud mental.' },
    { titulo: 'Técnica de anclaje 5-4-3-2-1', descripcion: 'Para cuando la mente se siente acelerada o dispersa.', etiqueta: 'autocuidado', youtubeSearch: 'técnica grounding 5 4 3 2 1 ansiedad español paso a paso', enlacesReferencia: [{ nombre: 'Técnica de Grounding 5-4-3-2-1 — PsyRed', url: 'https://psyred.org/tecnica-de-grounding/' }], detalleCompleto: 'Qué es:\nuna técnica de anclaje sensorial, conocida también como grounding, que busca dirigir la atención hacia las experiencias que están ocurriendo en el entorno inmediato. Puede ser útil cuando una persona se siente muy ansiosa, abrumada, dispersa o atrapada en pensamientos repetitivos.\n\nCómo aplicarla paso a paso:\n(1) Detenete un momento y realizá una respiración tranquila.\n(2) Observá a tu alrededor e identificá 5 cosas que podés ver.\n(3) Identificá 4 cosas que podés tocar o sentir con las manos o el cuerpo.\n(4) Prestá atención a 3 sonidos que podés escuchar.\n(5) Reconocé 2 olores que puedas percibir en ese momento.\n(6) Finalmente, identificá 1 sabor que tengas en la boca o imaginá un sabor agradable.\n(7) Realizá el ejercicio lentamente, intentando concentrarte en cada sensación antes de pasar a la siguiente.\n\nPor qué puede ayudar:\nla técnica busca cambiar el foco de atención desde pensamientos intensos o preocupantes hacia estímulos concretos del presente. Al involucrar diferentes sentidos, puede ayudar a recuperar una sensación de orientación y a disminuir la sensación de estar completamente absorbido por la ansiedad o el estrés.\n\nCuándo usarla:\npodés utilizarla cuando sentís que tu mente está acelerada, cuando estás atravesando un momento de ansiedad o cuando necesitás concentrarte nuevamente en el entorno que te rodea. También puede servir como una herramienta breve para recuperar la atención en el presente.\n\nCuándo no reemplaza ayuda profesional:\nsi los episodios de ansiedad, pánico, angustia o desconexión son frecuentes o afectan tu vida diaria, es recomendable consultar con un profesional de la salud mental para identificar sus causas y recibir orientación adecuada.' },
    { titulo: 'Caminar al aire libre', descripcion: 'Una de las formas más simples y accesibles de bajar el estrés diario.', etiqueta: 'autocuidado', youtubeSearch: 'beneficios caminar aire libre reducir estrés salud mental', enlacesReferencia: [{ nombre: 'Recomendaciones de actividad física — OMS', url: 'https://www.who.int/es/news-room/fact-sheets/detail/physical-activity' }], detalleCompleto: 'Qué es:\nuna práctica sencilla que combina movimiento físico moderado con el tiempo que pasás en espacios abiertos. No requiere una rutina deportiva compleja ni equipamiento especial y puede adaptarse a diferentes edades y niveles de condición física.\n\nCómo aplicarla paso a paso:\n(1) Elegí un momento del día que puedas mantener con cierta regularidad.\n(2) Seleccioná un lugar seguro y agradable para caminar, como un parque, una zona peatonal o un espacio al aire libre.\n(3) Comenzá caminando a un ritmo cómodo durante unos 15 o 20 minutos, ajustando el tiempo a tus posibilidades.\n(4) Si es posible, dejá el celular guardado durante parte del recorrido para reducir las distracciones.\n(5) Prestá atención a lo que ves, escuchás y sentís mientras caminás, sin exigirte mantener una concentración perfecta.\n(6) Con el tiempo, podés aumentar gradualmente la duración o frecuencia de las caminatas según tu comodidad.\n\nPor qué puede ayudar:\nla actividad física regular puede contribuir al bienestar general y está relacionada con beneficios para la salud física y mental. Caminar también puede ofrecer un espacio de pausa frente a las actividades cotidianas y favorecer momentos de desconexión y reflexión.\n\nCuándo usarla:\npodés incorporarla como una rutina diaria o varias veces por semana. También puede ser una opción cuando necesitás despejar la mente, cambiar de ambiente o tomar una pausa después de una jornada de estudio o trabajo.\n\nRecomendación:\nno es necesario caminar durante mucho tiempo para comenzar. Lo importante es elegir una frecuencia y duración que sean realistas para vos y aumentar progresivamente la actividad cuando sea posible.' },
    { titulo: 'Diario de 3 líneas', descripcion: 'Escribir un poco cada día, sin presión de que quede "bien".', etiqueta: 'autocuidado', youtubeSearch: 'diario de 3 líneas journaling escritura diaria bienestar español', enlacesReferencia: [{ nombre: 'Journaling terapéutico: qué dice la ciencia — DKV', url: 'https://quierocuidarme.dkv.es/ocio-y-bienestar/journaling-terapeutico' }], detalleCompleto: 'Qué es:\nuna práctica sencilla de escritura breve que consiste en dedicar unos minutos del día a poner por escrito pensamientos, emociones o experiencias. La idea del diario de 3 líneas es mantener la actividad simple y sostenible, sin preocuparse por escribir textos largos ni por hacerlo de una manera perfecta.\n\nCómo aplicarla paso a paso:\n(1) Elegí un momento tranquilo del día, por ejemplo antes de dormir o al finalizar tus actividades.\n(2) Tomate aproximadamente 2 o 5 minutos para escribir.\n(3) En la primera línea, anotá algo importante que haya ocurrido durante el día.\n(4) En la segunda línea, describí brevemente cómo te sentiste o qué emoción estuvo más presente.\n(5) En la tercera línea, escribí algo que esperás, agradecés o te gustaría hacer al día siguiente.\n(6) Escribí con libertad, sin preocuparte demasiado por la ortografía, la extensión o la calidad del texto.\n\nPor qué puede ayudar:\nponer por escrito determinadas experiencias puede facilitar la reflexión personal y ayudar a organizar pensamientos y emociones. Para algunas personas, escribir regularmente también puede servir como una forma de reconocer patrones en su estado de ánimo y observar cómo cambian sus preocupaciones con el paso del tiempo.\n\nCuándo usarla:\npodés practicarla diariamente como una actividad breve de cierre del día. También podés utilizarla únicamente cuando sintás la necesidad de ordenar tus pensamientos o reflexionar sobre una situación determinada.\n\nRecomendación:\nno existe una única forma correcta de llevar un diario. Si escribir sobre una situación te genera más angustia o aumenta pensamientos repetitivos, podés detener la práctica y considerar hablar con un profesional de la salud mental.' },
    { titulo: 'Higiene de sueño', descripcion: 'Pequeños cambios que mejoran mucho la calidad del descanso.', etiqueta: 'autocuidado', youtubeSearch: 'higiene del sueño consejos dormir mejor explicación', enlacesReferencia: [{ nombre: 'Buenos hábitos de sueño — Institutos Nacionales de Salud (NIH)', url: 'https://salud.nih.gov/recursos-de-salud/nih-noticias-de-salud/buenos-habitos-de-sueno-para-una-buena-salud' }], detalleCompleto: 'Qué es:\nun conjunto de hábitos y condiciones que pueden favorecer un descanso nocturno más adecuado. La higiene del sueño busca establecer rutinas consistentes y preparar el entorno para facilitar el descanso, teniendo en cuenta aspectos como los horarios, la iluminación, el uso de pantallas y el consumo de sustancias estimulantes.\n\nCómo aplicarla paso a paso:\n(1) Intentá mantener horarios relativamente similares para acostarte y levantarte todos los días.\n(2) Creá una rutina tranquila durante la última parte de la noche para preparar el cuerpo y la mente para dormir.\n(3) Reducí el uso de pantallas y la exposición a luz intensa antes de acostarte cuando sea posible.\n(4) Procurá que la habitación sea cómoda, oscura, silenciosa y con una temperatura agradable.\n(5) Evitá consumir cafeína u otras sustancias estimulantes cerca de la hora de dormir.\n(6) Si realizás ejercicio, procurá organizarlo de manera que no interfiera con tu descanso nocturno.\n(7) Intentá reservar la cama principalmente para dormir y descansar, evitando convertirla en un espacio habitual de trabajo o estudio.\n\nPor qué puede ayudar:\nmantener horarios regulares y crear condiciones favorables puede facilitar la consolidación de hábitos de sueño saludables. Un descanso adecuado es importante para el funcionamiento físico, emocional y cognitivo, por lo que establecer rutinas consistentes puede contribuir al bienestar general.\n\nCuándo usarla:\nla higiene del sueño funciona mejor como una práctica cotidiana y constante. Los cambios en los hábitos pueden requerir tiempo para convertirse en una rutina estable, por lo que es recomendable mantenerlos de forma regular y observar cómo responde el cuerpo.\n\nCuándo buscar ayuda profesional:\nsi tenés dificultades para dormir de manera frecuente, el problema persiste durante un período prolongado o afecta tu funcionamiento durante el día, es recomendable consultar con un profesional de la salud para determinar las posibles causas y recibir orientación adecuada.' },
    { titulo: 'Gratitud de 3 cosas', descripcion: 'Práctica corta con evidencia real de mejorar el ánimo con el tiempo.', etiqueta: 'autocuidado', youtubeSearch: 'práctica de gratitud diaria beneficios cómo hacer español', enlacesReferencia: [{ nombre: 'Gratitud y salud: cómo el agradecimiento diario mejora el bienestar — Infobae', url: 'https://www.infobae.com/america/ciencia-america/2025/12/05/gratitud-y-salud-como-el-agradecimiento-diario-mejora-el-animo-el-bienestar-y-las-relaciones-segun-la-psicologia/' }], detalleCompleto: 'Qué es:\nuna práctica breve de reflexión que consiste en identificar y escribir tres cosas por las que sentís agradecimiento. Pueden ser situaciones sencillas, personas importantes, experiencias agradables o pequeños momentos positivos del día. La finalidad es dedicar unos minutos a reconocer conscientemente aspectos que valorás.\n\nCómo aplicarla paso a paso:\n(1) Elegí un momento tranquilo, por ejemplo al finalizar el día.\n(2) Pensá en tres situaciones, personas o experiencias que hayan sido significativas para vos.\n(3) Escribí cada una de manera concreta, evitando limitarte a palabras generales.\n(4) Si es posible, explicá brevemente por qué esa situación fue importante o qué sensación positiva te produjo.\n(5) No es necesario encontrar acontecimientos extraordinarios; también pueden ser pequeños detalles de la vida cotidiana.\n(6) Repetí la práctica con la frecuencia que te resulte cómoda y observá cómo cambia tu percepción con el tiempo.\n\nPor qué puede ayudar:\nla práctica de reconocer aspectos positivos puede favorecer la reflexión sobre las experiencias agradables y ayudar a dirigir la atención hacia elementos que muchas veces pasan desapercibidos. Algunas investigaciones sobre gratitud han encontrado asociaciones con diferentes indicadores de bienestar, aunque sus efectos pueden variar entre personas y no sustituyen otros recursos de cuidado de la salud mental.\n\nCuándo usarla:\npodés realizarla por la noche como una forma de cerrar el día o en cualquier otro momento que te resulte cómodo. La constancia puede ser más importante que escribir durante largos períodos, por lo que una práctica breve puede ser suficiente para incorporarla a tu rutina.\n\nRecomendación:\nla gratitud no significa ignorar los problemas ni obligarte a sentirte bien cuando estás atravesando una situación difícil. Podés reconocer aspectos positivos de tu vida y, al mismo tiempo, aceptar emociones como tristeza, preocupación o frustración.' },
    { titulo: 'Hablar con alguien de confianza', descripcion: 'A veces la herramienta más simple es la más efectiva.', etiqueta: 'autocuidado', youtubeSearch: 'hablar con alguien de confianza apoyo emocional salud mental español', enlacesReferencia: [{ nombre: '¿Qué tipo de ayuda necesitas? — Salud Capital Bogotá', url: 'https://literalmente.saludcapital.gov.co/salud-mental/que-tipo-de-ayuda-necesitas/' }], detalleCompleto: 'Qué es:\nla práctica de compartir lo que sentís, expresar una preocupación o contar una experiencia difícil con una persona en quien confiás. No siempre se trata de encontrar una solución inmediata; en muchas ocasiones, poder hablar y sentirse escuchado puede ser un primer paso para afrontar una situación complicada.\n\nCómo aplicarla paso a paso:\n(1) Elegí una persona con la que te sintás seguro, respetado y escuchado.\n(2) Buscá un momento tranquilo en el que ambos puedan conversar sin demasiadas interrupciones.\n(3) Comenzá explicando brevemente cómo te sentís o qué situación te está preocupando.\n(4) Contale a la otra persona qué tipo de apoyo necesitás: ser escuchado, recibir una opinión o simplemente sentirte acompañado.\n(5) Si no querés recibir consejos, podés decirlo directamente y pedir que simplemente te escuchen.\n(6) Si la situación es demasiado difícil para manejarla únicamente con apoyo cercano, considerá buscar ayuda profesional.\n\nPor qué puede ayudar:\ncontar con relaciones de confianza y apoyo social puede contribuir al bienestar emocional y facilitar el afrontamiento de momentos difíciles. Compartir una preocupación con alguien de confianza también puede ayudar a disminuir la sensación de aislamiento y permitir que la persona se sienta acompañada mientras busca alternativas para afrontar lo que está viviendo.\n\nCuándo usarla:\npodés recurrir a esta herramienta cuando sentís que una preocupación te está afectando durante varios días, cuando necesitás expresar lo que estás viviendo o simplemente cuando querés sentirte acompañado. No es necesario esperar a estar en una crisis para hablar con alguien.\n\nCuándo buscar ayuda profesional:\nsi el malestar es intenso, persiste durante mucho tiempo, interfiere con tus actividades cotidianas o sentís que no podés manejarlo por tu cuenta, es recomendable buscar apoyo de un profesional de la salud mental. Hablar con una persona cercana puede ser un apoyo importante, pero no sustituye la atención profesional cuando esta es necesaria.' }
];

function obtenerRutaVegana() { return RUTA_VEGANA_CALI; }
function obtenerModaInclusiva() { return PERFILES_MODA_INCLUSIVA; }
function obtenerSaludMental() { return RECURSOS_SALUD_MENTAL; }

const RESOLVERES_POR_CATEGORIA = { 'vegana': obtenerRutaVegana, 'salud-mental': obtenerSaludMental, 'moda-inclusiva': obtenerModaInclusiva };

const obtenerBienestarPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.query;
        if (!categoria || !RESOLVERES_POR_CATEGORIA[categoria]) {
            return res.status(400).json({ ok: false, mensaje: 'Categoría inválida. Usa: vegana, salud-mental o moda-inclusiva' });
        }
        const cacheExistente = await BienestarCache.findOne({ categoria });
        const ahora = Date.now();
        const cacheVigente = cacheExistente && (ahora - cacheExistente.fechaActualizacion.getTime() < DURACION_CACHE_MS);
        if (cacheVigente) {
            return res.status(200).json({ ok: true, categoria, items: cacheExistente.items, fuente: 'cache' });
        }
        const resolver = RESOLVERES_POR_CATEGORIA[categoria];
        const items = await resolver();
        const actualizado = await BienestarCache.findOneAndUpdate(
            { categoria }, { items, fechaActualizacion: new Date() }, { returnDocument: 'after', upsert: true, runValidators: true }
        );
        return res.status(200).json({ ok: true, categoria, items: actualizado.items, fuente: 'curado' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener contenido de bienestar', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { obtenerBienestarPorCategoria };