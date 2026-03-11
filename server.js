const express = require('express');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Variables para caché de noticias
let noticiasCache = [];
let ultimaActualizacion = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// Leer y procesar el PDF de la normativa
const sections = [];
const pdfPath = path.join(__dirname, 'ordenanza_zbe_alicante.pdf');

// Simular la lectura del PDF (en producción, usar una librería como pdf-parse)
fs.readFile(pdfPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error al leer el PDF:', err);
        return;
    }

    // Aquí iría el procesamiento real del PDF
    // Por ahora, añadimos algunas secciones de ejemplo
    sections.push({
        title: "Artículo 1 - Objeto",
        content: "La presente ordenanza tiene por objeto establecer las normas reguladoras de la Zona de Bajas Emisiones (ZBE) en el municipio de Alicante."
    });
    sections.push({
        title: "Artículo 2 - Ámbito de aplicación",
        content: "La ZBE comprende el área delimitada por el casco urbano de la ciudad de Alicante, según los planos adjuntos."
    });
    sections.push({
        title: "Artículo 3 - Vehículos autorizados",
        content: "Podrán circular por la ZBE los vehículos que cumplan con las siguientes condiciones: vehículos eléctricos, híbridos, vehículos con etiqueta ECO, y vehículos con etiqueta C."
    });

    // Guardar las secciones para su uso posterior
    app.locals.sections = sections;
});

// Configurar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Ruta para manejar las preguntas
app.post('/ask', async (req, res) => {
    const question = req.body.question;
    try {
        let answers = [];
        for (let section of req.app.locals.sections) {
            const completion = await openai.completions.create({
                model: "gpt-3.5-turbo3",
                prompt: `Basado en el siguiente texto de la normativa ZBE Alicante: "${section.content}", responde a la pregunta: ${question}`,
                max_tokens: 150
            });
            answers.push({
                section: section.title,
                answer: completion.choices[0].text.trim()
            });
        }
        res.json({ answers });
    } catch (error) {
        console.error('Error al procesar la pregunta:', error);
        res.status(500).json({ error: 'Error al procesar la pregunta' });
    }
});

// API para obtener noticias sobre ZBE Alicante
app.get('/api/noticias', async (req, res) => {
    const ahora = Date.now();
    
    // Si tenemos caché y no ha expirado, devolverla
    if (noticiasCache.length > 0 && ultimaActualizacion && (ahora - ultimaActualizacion) < CACHE_DURATION) {
        console.log('Sirviendo noticias desde caché');
        return res.json({ noticias: noticiasCache });
    }
    
    // Si no, obtener noticias frescas
    try {
        const apiKey = 'd29440d585d63699264e9241536c8d48';
        const query = 'Zona Bajas Emisiones Alicante ZBE';
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=es&country=es&apikey=${apiKey}`;
        
        console.log('Obteniendo noticias frescas de GNews...');
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            // Procesar y limpiar las noticias
            noticiasCache = data.articles.map(article => ({
                titulo: article.title || '',
                descripcion: article.description || '',
                url: article.url || '',
                imagen: article.image || '',
                fecha: article.publishedAt || new Date().toISOString(),
                fuente: article.source?.name || 'Fuente desconocida'
            })).filter(noticia => noticia.titulo && noticia.url);
            
            ultimaActualizacion = ahora;
            console.log(`Obtenidas ${noticiasCache.length} noticias`);
        } else {
            console.log('No se encontraron noticias, usando ejemplos');
            noticiasCache = getNoticiasEjemplo();
            ultimaActualizacion = ahora;
        }
        
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        console.log('Usando noticias de ejemplo debido al error');
        noticiasCache = getNoticiasEjemplo();
        ultimaActualizacion = ahora;
    }
    
    res.json({ noticias: noticiasCache });
});

// Función para obtener noticias de ejemplo
function getNoticiasEjemplo() {
    return [
        {
            titulo: "Alicante amplía su Zona de Bajas Emisiones",
            descripcion: "El Ayuntamiento de Alicante anuncia la ampliación de la ZBE para incluir nuevos barrios y mejorar la calidad del aire.",
            url: "#",
            imagen: "https://via.placeholder.com/300x200/28a745/ffffff?text=Noticia+ZBE",
            fecha: new Date(Date.now() - 86400000).toISOString(), // Ayer
            fuente: "El País"
        },
        {
            titulo: "Nuevas restricciones de tráfico en el centro",
            descripcion: "A partir del próximo mes, los vehículos sin etiqueta ambiental no podrán circular por el centro de Alicante.",
            url: "#",
            imagen: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Restricciones",
            fecha: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
            fuente: "Información"
        },
        {
            titulo: "Subvenciones para vehículos eléctricos",
            descripcion: "La Generalitat Valenciana lanza un nuevo plan de ayudas para la compra de vehículos eléctricos en la provincia.",
            url: "#",
            imagen: "https://via.placeholder.com/300x200/007bff/ffffff?text=Subvenciones",
            fecha: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
            fuente: "Las Provincias"
        }
    ];
}

// Ruta para obtener las secciones de la normativa
app.get('/api/normativa', (req, res) => {
    res.json({ sections: req.app.locals.sections });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
