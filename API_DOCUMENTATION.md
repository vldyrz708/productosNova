# 🎵 API de Álbumes K-pop - productosNova

API REST completa para la gestión y venta de álbumes K-pop.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 14+
- MongoDB
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start
```

### Configuración de Base de Datos
- Base de datos: `productos_k-pop`
- URL por defecto: `mongodb://localhost:27017/productos_k-pop`

## 📋 Endpoints de la API

### Base URL
```
http://localhost:3000/api/albums
```

### 🔍 Búsqueda y Listado

#### Obtener todos los álbumes
```http
GET /api/albums
```

**Parámetros de consulta:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `artista` (string): Filtrar por artista
- `categoria` (string): Filtrar por categorías (separadas por coma)
- `disponible` (boolean): Solo álbumes disponibles
- `precioMin` (number): Precio mínimo
- `precioMax` (number): Precio máximo

**Ejemplo:**
```
GET /api/albums?page=1&limit=5&artista=BTS&disponible=true
```

#### Buscar álbumes
```http
GET /api/albums/search
```

**Parámetros de consulta:**
- `q` (string): Término de búsqueda
- `categoria` (string): Filtrar por categorías
- `artista` (string): Filtrar por artista
- `precioMin` (number): Precio mínimo
- `precioMax` (number): Precio máximo
- `disponible` (boolean): Solo disponibles

**Ejemplo:**
```
GET /api/albums/search?q=love yourself&categoria=K-Pop,Boy Group
```

#### Obtener álbumes por artista
```http
GET /api/albums/artista/:artista
```

**Ejemplo:**
```
GET /api/albums/artista/BLACKPINK
```

#### Obtener álbumes por categoría
```http
GET /api/albums/categoria/:categoria
```

**Ejemplo:**
```
GET /api/albums/categoria/Girl Group
```

### 📊 Estadísticas

#### Obtener estadísticas generales
```http
GET /api/albums/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalAlbumes": 150,
    "albumesDisponibles": 120,
    "albumesAgotados": 30,
    "estadisticasPorCategoria": [...],
    "albumesMasCaros": [...]
  }
}
```

### 🔧 CRUD Operaciones

#### Obtener álbum por ID
```http
GET /api/albums/:id
```

#### Crear nuevo álbum
```http
POST /api/albums
Content-Type: multipart/form-data
```

**Campos requeridos:**
```json
{
  "nombreAlbum": "Love Yourself: Tear",
  "artista": "BTS",
  "versionAlbum": "Standard",
  "fechaLanzamiento": "2018-05-18",
  "idioma": ["Coreano", "Inglés"],
  "duracion": "45:30",
  "pesoGramos": 150,
  "precio": 25.99,
  "stock": 100,
  "categoria": ["K-Pop", "Boy Group"],
  "descripcion": "Descripción del álbum...",
  "fotoAlbum": "archivo de imagen",
  "fechaAdquisicion": "2024-01-15",
  "fechaLimiteVenta": "2025-12-31"
}
```

#### Actualizar álbum
```http
PUT /api/albums/:id
Content-Type: multipart/form-data
```

#### Eliminar álbum
```http
DELETE /api/albums/:id
```

#### Actualizar stock
```http
PATCH /api/albums/:id/stock
Content-Type: application/json

{
  "cantidad": 10
}
```

## 🎯 Modelo de Datos

### Esquema de Álbum

```javascript
{
  nombreAlbum: String,           // Nombre del álbum
  artista: String,               // Artista/Grupo
  versionAlbum: String,          // Standard, Deluxe, Limited Edition, etc.
  fechaLanzamiento: Date,        // Fecha de lanzamiento original
  idioma: [String],              // Idiomas del álbum
  duracion: String,              // Duración total (formato MM:SS o HH:MM:SS)
  pesoGramos: Number,            // Peso físico en gramos
  precio: Number,                // Precio de venta
  stock: Number,                 // Cantidad disponible
  categoria: [String],           // Categorías/géneros
  descripcion: String,           // Descripción detallada
  fotoAlbum: String,             // URL o ruta de la imagen
  fechaAdquisicion: Date,        // Fecha de adquisición para inventario
  fechaLimiteVenta: Date,        // Fecha límite de venta
  activo: Boolean,               // Estado activo/inactivo
  disponibleVenta: Boolean,      // Virtual: si está disponible para venta
  diasRestantesVenta: Number     // Virtual: días restantes de venta
}
```

### Valores Permitidos

#### Versiones de Álbum
- Standard
- Deluxe
- Limited Edition
- Special Edition
- Repackage
- Mini Album
- Single

#### Idiomas
- Coreano
- Japonés
- Inglés
- Chino
- Tailandés
- Español
- Otro

#### Categorías
- K-Pop
- J-Pop
- Boy Group
- Girl Group
- Solista
- Ballad
- Dance
- R&B
- Hip-Hop
- Rock
- Indie

## 📁 Manejo de Archivos

### Subida de Fotos
- **Ruta:** `/uploads`
- **Formatos permitidos:** JPEG, JPG, PNG, GIF, WebP
- **Tamaño máximo:** 5MB
- **Nombre de campo:** `fotoAlbum`

### Acceso a Imágenes
Las imágenes subidas están disponibles en:
```
http://localhost:3000/uploads/nombre-archivo.jpg
```

## 🔒 Validaciones

### Validaciones de Datos
- Campos obligatorios verificados
- Formatos de fecha validados
- Rangos de precios y stock controlados
- Tipos de archivo de imagen verificados
- Duración en formato correcto (MM:SS o HH:MM:SS)

### Validaciones de Negocio
- La fecha límite de venta debe ser posterior a la fecha de adquisición
- El stock no puede ser negativo
- Los precios deben ser números positivos

## 📈 Características Avanzadas

### Búsqueda de Texto Completo
- Búsqueda en nombre del álbum, artista y descripción
- Indexación optimizada para consultas rápidas
- Scoring de relevancia en resultados

### Paginación
- Paginación automática en listados
- Control de límite de resultados
- Información de páginas totales

### Filtros Múltiples
- Combinación de múltiples filtros
- Filtros por rango de precios
- Filtros por disponibilidad

### Soft Delete
- Los álbumes eliminados se marcan como inactivos
- Preservación de datos para auditoría
- Recuperación posible

## 🚀 Ejemplos de Uso

### Buscar álbumes de BTS disponibles
```bash
curl "http://localhost:3000/api/albums/search?q=BTS&disponible=true"
```

### Crear un nuevo álbum
```bash
curl -X POST http://localhost:3000/api/albums \
  -F "nombreAlbum=Map of the Soul: 7" \
  -F "artista=BTS" \
  -F "versionAlbum=Standard" \
  -F "fechaLanzamiento=2020-02-21" \
  -F "idioma=Coreano,Inglés" \
  -F "duracion=75:42" \
  -F "pesoGramos=180" \
  -F "precio=29.99" \
  -F "stock=50" \
  -F "categoria=K-Pop,Boy Group" \
  -F "descripcion=Cuarto álbum de estudio..." \
  -F "fotoAlbum=@album-cover.jpg" \
  -F "fechaAdquisicion=2024-01-01" \
  -F "fechaLimiteVenta=2025-12-31"
```

### Actualizar stock
```bash
curl -X PATCH http://localhost:3000/api/albums/ID_DEL_ALBUM/stock \
  -H "Content-Type: application/json" \
  -d '{"cantidad": -5}'
```

## 🛠️ Scripts Disponibles

- `npm start` - Inicia el servidor de producción
- `npm run dev` - Inicia el servidor con nodemon (desarrollo)
- `npm run vlad` - Script personalizado del equipo
- `npm test` - Ejecuta las pruebas (pendiente configuración)

## 👥 Equipo de Desarrollo

- Vladimir Alvarez
- Alondra Sanchez  
- Yenifer Martinez
- Alan Palafox