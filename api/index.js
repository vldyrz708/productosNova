const express = require('express');
const cors = require('cors');
const path = require('path');
// const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');

// Importar conexión a la base de datos
const conection = require('./database/conection');

//doc de scalar
const { apiReference } = require('@scalar/express-api-reference');

// Importar middlewares
const { manejoErrores, rutaNoEncontrada, logRequest, sanitizarEntrada } = require('./middleware/errores');

// Importar rutas
const albumRoutes = require('./routes/albumRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging
app.use(logRequest);

// Configuración de CORS más específica para frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de sanitización
app.use(sanitizarEntrada);

// Servir archivos estáticos (fotos de álbumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// PROTECCIÓN SERVER-SIDE: servir páginas protegidas solo si el usuario está autenticado
const { verifyToken, requireRole } = require('./middleware/auth');

// PROTECCIÓN: servir directorios estáticos protegidos mediante middleware
// Cajero: solo Usuario
app.use('/cashier', verifyToken, requireRole('Usuario'), express.static(path.join(__dirname, '..', 'frontend', 'cashier')));

// Gerente: Gerente o Admin
app.use('/gerente', verifyToken, requireRole('Gerente','Admin'), express.static(path.join(__dirname, '..', 'frontend', 'gerente')));

// Admin: solo Admin
app.use('/admin', verifyToken, requireRole('Admin'), express.static(path.join(__dirname, '..', 'frontend', 'admin')));

// Servir archivos estáticos desde la carpeta "frontend" (públicos)
app.use(express.static(path.join(__dirname, './../frontend')));

// Conectar a MongoDB
conection();

// Rutas
app.use('/api/albums', albumRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

//documentacion de la api
app.use(
  '/doc',
  apiReference({
    spec: {url: '/swagger.json',}
  }),
)

app.get('/swagger.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'swagger.json'));
});

// Endpoint de salud para el frontend
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected' 
    });
});

// Endpoint de información de la API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: '🎵 API de Álbumes K-pop - productosNova',
        version: '1.0.0',
        status: 'Funcionando correctamente',
        endpoints: {
            albums: {
                url: '/api/albums',
                methods: ['GET', 'POST']
            },
            users: {
                url: '/api/users',
                methods: ['GET', 'POST']
            },
            album_by_id: {
                url: '/api/albums/:id',
                methods: ['GET', 'PATCH', 'DELETE']
            },
            user_by_id: {
                url: '/api/users/:id',
                methods: ['GET', 'PATCH', 'DELETE']
            },
            search: {
                url: '/api/albums/search',
                methods: ['GET']
            },
            by_artist: {
                url: '/api/albums/artista/:artista',
                methods: ['GET']
            },
            by_category: {
                url: '/api/albums/categoria/:categoria',
                methods: ['GET']
            },
            stats: {
                url: '/api/albums/stats',
                methods: ['GET']
            }
        },
        documentation: 'Ver API_DOCUMENTATION.md para detalles completos'
    });
});

// Ruta raíz sirve el frontend
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/index.html'));
});

// Middleware de manejo de errores (debe ir después de las rutas)
app.use(manejoErrores);

// Middleware para rutas no encontradas (debe ir al final)
app.use(rutaNoEncontrada);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Documentación: http://localhost:${PORT}/`);
});