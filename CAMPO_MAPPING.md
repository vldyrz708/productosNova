# Mapeo de Campos Frontend ↔ Backend

## Campos del Modelo MongoDB (Album.js)

### Campos REQUERIDOS:
1. **nombreAlbum** - String (max 100 chars)
2. **artista** - String (max 80 chars) → Frontend: `artistaGrupo`
3. **versionAlbum** - String ENUM → Frontend: `version`
   - Valores: Standard, Deluxe, Limited Edition, Special Edition, Repackage, Mini Album, Single
4. **fechaLanzamiento** - Date
5. **idioma** - Array[String] ENUM
   - Valores: Coreano, Japonés, Inglés, Chino, Tailandés, Español, Otro
6. **duracion** - String (formato MM:SS o HH:MM:SS)
7. **pesoGramos** - Number (1-2000) → Frontend: `peso`
8. **precio** - Number (min 0)
9. **stock** - Number (min 0)
10. **categoria** - Array[String] ENUM
    - Valores: K-Pop, J-Pop, Boy Group, Girl Group, Solista, Ballad, Dance, R&B, Hip-Hop, Rock, Indie
11. **descripcion** - String (max 1000 chars)
12. **fotoAlbum** - String (ruta archivo)
13. **fechaAdquisicion** - Date → Frontend: `fechaCompra`
14. **fechaLimiteVenta** - Date → Frontend: `fechaCaducidad`

## Campos del Frontend (modalregistro.html)

1. nombreAlbum ✅
2. artistaGrupo → artista ✅
3. version → versionAlbum ✅
4. fechaLanzamiento ✅
5. idioma ✅
6. duracion ✅
7. peso → pesoGramos ✅
8. stock ✅
9. categoria ✅
10. descripcion ✅
11. fechaCompra → fechaAdquisicion ✅
12. fechaCaducidad → fechaLimiteVenta ✅
13. imagen (file) → fotoAlbum ✅

## Campo FALTANTE en Frontend:
- **precio** (Number, requerido) ❌ NO ESTÁ EN EL FORMULARIO

Este es el problema principal.
