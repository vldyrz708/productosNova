# 🎵 productosNova - API de Álbumes K-pop

API REST completa para la gestión y venta de álbumes K-pop desarrollada con Node.js, Express y MongoDB.

## 🚀 Características

- ✅ CRUD completo de álbumes
- 🔍 Búsqueda avanzada con filtros múltiples
- 📁 Subida y gestión de imágenes
- 📊 Sistema de estadísticas
- 🏷️ Categorización y etiquetado
- 📦 Control de inventario y stock
- 🔄 Paginación automática
- ⚡ Optimización con índices de MongoDB

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js + Express.js
- **Base de Datos:** MongoDB + Mongoose
- **Subida de Archivos:** Multer
- **Validación:** Validator.js
- **CORS:** Habilitado para frontend

## 📋 Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/vldyrz708/productosNova.git
cd productosNova

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start
```

## 🎯 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/albums` | Obtener todos los álbumes |
| GET | `/api/albums/search` | Buscar álbumes |
| GET | `/api/albums/:id` | Obtener álbum por ID |
| POST | `/api/albums` | Crear nuevo álbum |
| PUT | `/api/albums/:id` | Actualizar álbum |
| DELETE | `/api/albums/:id` | Eliminar álbum |
| GET | `/api/albums/stats` | Estadísticas generales |

## 📖 Documentación Completa

Para documentación detallada de la API, consulta [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Base de Datos

- **Nombre:** `productos_k-pop`
- **Colección:** `albums`
- **URL:** `mongodb://localhost:27017/productos_k-pop`

## 👥 Equipo de Desarrollo

- **Vladimir Alvarez** - @vldyrz708
- **Alondra Sanchez**
- **Yenifer Martinez** 
- **Alan Palafox**

## 📄 Licencia

ISC License
