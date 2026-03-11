document.addEventListener('DOMContentLoaded', function() {
    // Utilizamos la API de Gnews.io para obtener noticias de Google News
    const apiKey = 'd29440d585d63699264e9241536c8d48';
    
    // Mostrar mensaje en la consola para depuración
    console.log('Script de noticias cargado correctamente');
    // Términos de búsqueda relacionados con la ZBE de Alicante
    const queries = [
        'zona bajas emisiones alicante',
        'ZBE alicante',
        'restricciones tráfico alicante',
        'movilidad sostenible alicante',
        'contaminación alicante'
    ];
    
    // Nombre de la clave para el almacenamiento local
    const STORAGE_KEY = 'zbe_alicante_noticias';
    const LAST_FETCH_KEY = 'zbe_alicante_last_fetch';
    
    // Tiempo mínimo entre actualizaciones de noticias (24 horas en milisegundos)
    const MIN_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
    
    // Seleccionamos una consulta aleatoria para obtener resultados variados
    const query = queries[Math.floor(Math.random() * queries.length)];
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=es&country=es&max=10&apikey=${apiKey}&sortby=publishedAt`;
    
    // Función para obtener noticias almacenadas en localStorage
    const obtenerNoticiasGuardadas = () => {
        const noticiasGuardadas = localStorage.getItem(STORAGE_KEY);
        return noticiasGuardadas ? JSON.parse(noticiasGuardadas) : [];
    };
    
    // Función para guardar noticias en localStorage
    const guardarNoticias = (noticias) => {
        // Obtener noticias existentes
        const noticiasExistentes = obtenerNoticiasGuardadas();
        
        // Combinar noticias nuevas con existentes, evitando duplicados
        const todasLasNoticias = [...noticiasExistentes];
        
        noticias.forEach(noticiaNueva => {
            // Verificar si la noticia ya existe (por URL o título)
            const yaExiste = noticiasExistentes.some(noticiaExistente => 
                noticiaExistente.url === noticiaNueva.url || 
                noticiaExistente.title === noticiaNueva.title
            );
            
            // Si no existe, añadirla al array
            if (!yaExiste) {
                todasLasNoticias.push(noticiaNueva);
            }
        });
        
        // Ordenar por fecha (más reciente primero)
        todasLasNoticias.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todasLasNoticias));
        localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
        
        return todasLasNoticias;
    };
    
    // Función para mostrar un mensaje de carga
    const mostrarCargando = () => {
        const container = document.querySelector('.noticias-container');
        container.innerHTML = `
            <div class="cargando">
                <p>Cargando noticias sobre la Zona de Bajas Emisiones de Alicante...</p>
            </div>
        `;
    };
    
    // Función para mostrar un mensaje de error
    const mostrarError = (mensaje) => {
        const container = document.querySelector('.noticias-container');
        container.innerHTML = `
            <div class="error-mensaje">
                <p>${mensaje}</p>
            </div>
        `;
        
        // Intentar mostrar noticias guardadas
        const noticiasGuardadas = obtenerNoticiasGuardadas();
        if (noticiasGuardadas.length > 0) {
            container.innerHTML += `<p>Mostrando noticias guardadas anteriormente:</p>`;
            mostrarNoticias(noticiasGuardadas);
        }
        // No llamamos a mostrarNoticiasEjemplo() aquí porque lo haremos en el catch
    };
    
    // Función para mostrar noticias de ejemplo en caso de error
    const mostrarNoticiasEjemplo = () => {
        const container = document.querySelector('.noticias-container');
        
        // Añadir mensaje explicativo
        container.innerHTML = `
            <div class="noticias-info">
                <p>Mostrando noticias de ejemplo mientras se restablece la conexión con el servidor:</p>
            </div>
        `;
        const noticiasEjemplo = [
            {
                title: 'Entrada en vigor de la Zona de Bajas Emisiones',
                description: 'La Zona de Bajas Emisiones de Alicante entrará en vigor próximamente. Los vehículos sin etiqueta ambiental tendrán restricciones en el centro de la ciudad.',
                url: '#',
                publishedAt: new Date().toISOString(),
                source: { name: 'Ejemplo' }
            },
            {
                title: 'Nuevos puntos de recarga para vehículos eléctricos',
                description: 'El Ayuntamiento de Alicante ha anunciado la instalación de nuevos puntos de recarga para vehículos eléctricos en diferentes zonas de la ciudad.',
                url: '#',
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: { name: 'Ejemplo' }
            },
            {
                title: 'Campaña informativa sobre la ZBE',
                description: 'Se ha puesto en marcha una campaña informativa para dar a conocer a los ciudadanos los detalles sobre la nueva Zona de Bajas Emisiones.',
                url: '#',
                publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                source: { name: 'Ejemplo' }
            }
        ];
        
        // Añadir las noticias de ejemplo después del mensaje de error
        noticiasEjemplo.forEach(noticia => {
            const fecha = new Date(noticia.publishedAt);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            const articuloHTML = `
                <article class="noticia">
                    <div class="noticia-fecha">${fechaFormateada} - Fuente: ${noticia.source.name}</div>
                    <h2>${noticia.title}</h2>
                    <p>${noticia.description}</p>
                    <a href="${noticia.url}" class="leer-mas" target="_blank">Leer más</a>
                </article>
            `;
            
            container.innerHTML += articuloHTML;
        });
    };
    
    // Función para filtrar y mostrar las noticias
    const mostrarNoticias = (noticias) => {
        const container = document.querySelector('.noticias-container');
        container.innerHTML = ''; // Limpiar el contenedor
        
        if (noticias.length === 0) {
            container.innerHTML = `
                <div class="error-mensaje">
                    <p>No se encontraron noticias sobre la Zona de Bajas Emisiones de Alicante.</p>
                </div>
            `;
            mostrarNoticiasEjemplo();
            return;
        }
        
        // Filtrar noticias relevantes (desde la actualidad hasta 2020)
        const noticiasRelevantes = noticias.filter(noticia => {
            const fecha = new Date(noticia.publishedAt);
            return fecha.getFullYear() >= 2020;
        });
        
        // Ordenar por fecha (de más reciente a más antigua)
        noticiasRelevantes.sort((a, b) => {
            return new Date(b.publishedAt) - new Date(a.publishedAt);
        });
        
        // Limitar a 5 noticias para mostrar
        const noticiasAMostrar = noticiasRelevantes.slice(0, 5);
        
        if (noticiasAMostrar.length === 0) {
            container.innerHTML = `
                <div class="error-mensaje">
                    <p>No se encontraron noticias recientes sobre la Zona de Bajas Emisiones de Alicante.</p>
                </div>
            `;
            mostrarNoticiasEjemplo();
            return;
        }
        
        // Añadir título para la sección de noticias
        container.innerHTML = `
            <div class="noticias-header">
                <h3>Últimas noticias sobre movilidad sostenible en Alicante</h3>
            </div>
        `;
        
        // Mostrar la última fecha de actualización
        const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
        if (lastFetch) {
            const lastFetchDate = new Date(parseInt(lastFetch));
            const fechaActualizacion = lastFetchDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            container.innerHTML += `
                <div class="actualizacion-info">
                    <p>Última actualización: ${fechaActualizacion}</p>
                </div>
            `;
        }
        
        noticiasAMostrar.forEach(noticia => {
            const fecha = new Date(noticia.publishedAt);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            // Crear un extracto de la descripción si es demasiado larga
            let descripcion = noticia.description || 'Sin descripción disponible';
            if (descripcion.length > 200) {
                descripcion = descripcion.substring(0, 197) + '...';
            }
            
            const articuloHTML = `
                <article class="noticia">
                    <div class="noticia-fecha">${fechaFormateada} - <strong>Fuente: ${noticia.source ? noticia.source.name : 'Desconocida'}</strong></div>
                    <h2>${noticia.title}</h2>
                    <p>${descripcion}</p>
                    <a href="${noticia.url}" class="leer-mas" target="_blank">Leer artículo completo</a>
                </article>
            `;
            
            container.innerHTML += articuloHTML;
        });
    };
    
    // Comprobar si tenemos noticias guardadas y cuándo fue la última actualización
    const noticiasGuardadas = obtenerNoticiasGuardadas();
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    const ahora = Date.now();
    
    // Decidir si debemos cargar desde la API o usar las noticias guardadas
    // Forzar siempre la actualización, ignorando la caché
    const deberiaActualizar = true;
    
    // Si tenemos noticias guardadas, mostrarlas inmediatamente
    if (noticiasGuardadas.length > 0) {
        mostrarNoticias(noticiasGuardadas);
    } else {
        // Si no hay noticias guardadas, mostrar mensaje de carga
        mostrarCargando();
    }
    
    // Si debemos actualizar o no tenemos noticias guardadas, hacer la petición a la API
    if (deberiaActualizar || noticiasGuardadas.length === 0) {
        // Petición a GNews
        const gnewsPromise = fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.status}`);
                }
                return response.json();
            })
            .then(data => (data && data.articles ? data.articles : []))
            .catch(error => {
                console.error('Error al obtener noticias de GNews:', error);
                return [];
            });

        // Petición a DuckDuckGo
        const ddgPromise = fetch('/api/duckduckgo-news')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.status}`);
                }
                return response.json();
            })
            .then(data => (data && data.articles ? data.articles : []))
            .catch(error => {
                console.error('Error al obtener noticias de DuckDuckGo:', error);
                return [];
            });

        Promise.all([gnewsPromise, ddgPromise])
            .then(([gnewsNoticias, ddgNoticias]) => {
                console.log('Noticias recibidas de GNews:', gnewsNoticias);
                console.log('Noticias recibidas de DuckDuckGo:', ddgNoticias);
                const todasLasNoticias = guardarNoticias([...gnewsNoticias, ...ddgNoticias]);
                if (noticiasGuardadas.length === 0 || document.querySelector('.cargando')) {
                    mostrarNoticias(todasLasNoticias);
                }
                console.log(`GNews: ${gnewsNoticias.length} | DuckDuckGo: ${ddgNoticias.length} | Total guardadas: ${todasLasNoticias.length}`);
                if (gnewsNoticias.length === 0 && ddgNoticias.length === 0 && noticiasGuardadas.length === 0) {
                    mostrarError('No se pudieron cargar noticias de ninguna fuente.');
                    mostrarNoticiasEjemplo();
                }
            })
            .catch(error => {
                console.error('Error combinando noticias:', error);
                if (noticiasGuardadas.length === 0) {
                    mostrarError('No se pudieron cargar las noticias en este momento. Por favor, inténtalo de nuevo más tarde.');
                    mostrarNoticiasEjemplo();
                }
            });
    
    } else {
        console.log('Usando noticias guardadas. Próxima actualización en:', new Date(parseInt(lastFetch) + MIN_UPDATE_INTERVAL).toLocaleString());
    }
});
