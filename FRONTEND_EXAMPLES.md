# 🎵 Ejemplos de Uso de la API - Frontend

## 📡 Configuración Base

```javascript
const API_BASE_URL = 'http://localhost:3000';
const API_ALBUMS_URL = `${API_BASE_URL}/api/albums`;

// Headers comunes para todas las peticiones
const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
```

## 🔍 Obtener Álbumes

### Listar todos los álbumes
```javascript
async function obtenerAlbumes(page = 1, limit = 10) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

### Buscar álbumes
```javascript
async function buscarAlbumes(query, filtros = {}) {
    try {
        const params = new URLSearchParams({
            q: query,
            ...filtros
        });
        
        const response = await fetch(`${API_ALBUMS_URL}/search?${params}`);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error en búsqueda:', error);
        throw error;
    }
}

// Ejemplo de uso
buscarAlbumes('BTS', {
    categoria: 'K-Pop,Boy Group',
    disponible: 'true',
    precioMin: '10',
    precioMax: '50'
});
```

### Obtener álbum por ID
```javascript
async function obtenerAlbumPorId(id) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/${id}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## ➕ Crear Álbum

```javascript
async function crearAlbum(albumData, imagen) {
    try {
        const formData = new FormData();
        
        // Agregar datos del álbum
        Object.keys(albumData).forEach(key => {
            if (Array.isArray(albumData[key])) {
                albumData[key].forEach(item => {
                    formData.append(key, item);
                });
            } else {
                formData.append(key, albumData[key]);
            }
        });
        
        // Agregar imagen si existe
        if (imagen) {
            formData.append('fotoAlbum', imagen);
        }
        
        const response = await fetch(API_ALBUMS_URL, {
            method: 'POST',
            body: formData
            // No incluir Content-Type header, el navegador lo establecerá automáticamente
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data;
        } else {
            throw new Error(data.message || 'Error al crear álbum');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Ejemplo de uso
const albumData = {
    nombreAlbum: 'Love Yourself: Tear',
    artista: 'BTS',
    versionAlbum: 'Standard',
    fechaLanzamiento: '2018-05-18',
    idioma: ['Coreano', 'Inglés'],
    duracion: '45:30',
    pesoGramos: 150,
    precio: 25.99,
    stock: 100,
    categoria: ['K-Pop', 'Boy Group'],
    descripcion: 'Tercer álbum de estudio de BTS...',
    fechaAdquisicion: '2024-01-15',
    fechaLimiteVenta: '2025-12-31'
};

const imagenFile = document.getElementById('fileInput').files[0];
crearAlbum(albumData, imagenFile);
```

## ✏️ Actualizar Álbum

```javascript
async function actualizarAlbum(id, albumData, nuevaImagen = null) {
    try {
        const formData = new FormData();
        
        Object.keys(albumData).forEach(key => {
            if (Array.isArray(albumData[key])) {
                albumData[key].forEach(item => {
                    formData.append(key, item);
                });
            } else {
                formData.append(key, albumData[key]);
            }
        });
        
        if (nuevaImagen) {
            formData.append('fotoAlbum', nuevaImagen);
        }
        
        const response = await fetch(`${API_ALBUMS_URL}/${id}`, {
            method: 'PUT',
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 🗑️ Eliminar Álbum

```javascript
async function eliminarAlbum(id) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/${id}`, {
            method: 'DELETE',
            headers
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 📦 Actualizar Stock

```javascript
async function actualizarStock(id, cantidad) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/${id}/stock`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ cantidad })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Ejemplos de uso
actualizarStock('album_id', 10);  // Agregar 10 al stock
actualizarStock('album_id', -5);  // Reducir 5 del stock
```

## 📊 Obtener Estadísticas

```javascript
async function obtenerEstadisticas() {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/stats`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 🎭 Filtros por Artista/Categoría

```javascript
async function obtenerAlbumesPorArtista(artista) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/artista/${encodeURIComponent(artista)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function obtenerAlbumesPorCategoria(categoria) {
    try {
        const response = await fetch(`${API_ALBUMS_URL}/categoria/${encodeURIComponent(categoria)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 🔍 Verificar Estado de la API

```javascript
async function verificarEstadoAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API no disponible:', error);
        return { success: false, status: 'offline' };
    }
}
```

## 🎨 Ejemplo de Componente React

```jsx
import React, { useState, useEffect } from 'react';

function AlbumesList() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        cargarAlbumes();
    }, [page]);

    const cargarAlbumes = async () => {
        try {
            setLoading(true);
            const response = await obtenerAlbumes(page, 10);
            setAlbums(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error al cargar álbumes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <h2>Álbumes K-pop</h2>
            <div className="albums-grid">
                {albums.map(album => (
                    <div key={album._id} className="album-card">
                        <img src={`${API_BASE_URL}/${album.fotoAlbum}`} alt={album.nombreAlbum} />
                        <h3>{album.nombreAlbum}</h3>
                        <p>{album.artista}</p>
                        <p>${album.precio}</p>
                        <p>Stock: {album.stock}</p>
                    </div>
                ))}
            </div>
            
            {/* Paginación */}
            <div className="pagination">
                <button 
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </button>
                <span>Página {pagination.page} de {pagination.pages}</span>
                <button 
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
```

## 🛡️ Manejo de Errores

```javascript
// Función helper para manejar errores de la API
function manejarErrorAPI(error, response) {
    if (!response.ok) {
        if (response.status === 400) {
            return 'Datos inválidos. Verifica la información enviada.';
        } else if (response.status === 404) {
            return 'Álbum no encontrado.';
        } else if (response.status === 500) {
            return 'Error del servidor. Intenta más tarde.';
        }
    }
    return error.message || 'Error desconocido';
}

// Wrapper para peticiones con manejo de errores
async function peticionAPI(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(manejarErrorAPI(null, response));
        }
        
        return data;
    } catch (error) {
        throw new Error(manejarErrorAPI(error, null));
    }
}
```

## 📝 Valores Permitidos

### Versiones de Álbum
- Standard
- Deluxe
- Limited Edition
- Special Edition
- Repackage
- Mini Album
- Single

### Idiomas
- Coreano
- Japonés
- Inglés
- Chino
- Tailandés
- Español
- Otro

### Categorías
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